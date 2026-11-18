import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import path from "path";
import fs from "fs";

const ALLOWED_MIME_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
  "video/ogg",
]);

const ALLOWED_EXTENSIONS = new Set([".mp4", ".webm", ".mov", ".avi", ".ogg"]);
const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024; // 500MB limit for Cloudflare R2

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Media addition is strictly restricted to Super Admin
  if (session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json(
      { error: "Forbidden. Media addition and video uploads are restricted to Super Admin." },
      { status: 403 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 1. File Size Validation (up to 500MB for Cloudflare R2)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File exceeds 500MB maximum upload limit." },
        { status: 413 }
      );
    }

    // 2. MIME Type Validation
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: `Unsupported media type "${file.type}". Only MP4, WebM, and MOV are supported.` },
        { status: 415 }
      );
    }

    // 3. File Extension Validation
    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { error: `Invalid file extension "${ext}". Must be .mp4, .webm, or .mov` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeBase = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
    const safeFilename = `${Date.now()}-${safeBase}${ext}`;
    const tenantFolder = session.user.tenantId || "admin";

    // 4. Primary: Stream directly to Cloudflare R2 if configured
    let r2Endpoint = process.env.R2_ENDPOINT?.trim();
    if (r2Endpoint && !r2Endpoint.startsWith("http")) {
      r2Endpoint = `https://${r2Endpoint}`;
    }
    r2Endpoint = r2Endpoint?.replace(/\/+$/, "");

    const r2AccessKey = process.env.R2_ACCESS_KEY_ID?.trim();
    const r2SecretKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
    const r2Bucket = process.env.R2_BUCKET_NAME?.trim();

    if (r2Endpoint && r2AccessKey && r2SecretKey && r2Bucket) {
      const s3 = new S3Client({
        region: "auto",
        endpoint: r2Endpoint,
        forcePathStyle: true,
        credentials: {
          accessKeyId: r2AccessKey,
          secretAccessKey: r2SecretKey,
        },
      });

      const key = `${tenantFolder}/videos/${safeFilename}`;

      await s3.send(
        new PutObjectCommand({
          Bucket: r2Bucket,
          Key: key,
          Body: buffer,
          ContentType: file.type || "video/mp4",
        })
      );

      const baseUrl = (process.env.R2_PUBLIC_URL || `${r2Endpoint}/${r2Bucket}`).trim().replace(/\/+$/, "");
      const publicUrl = `${baseUrl}/${key}`;

      return NextResponse.json({
        url: publicUrl,
        filename: safeFilename,
        key,
        storage: "cloudflare-r2",
        provider: "Cloudflare R2",
      });
    }

    // 5. Fallback: Local disk storage if R2 is not configured
    const uploadDir = path.join(process.cwd(), "public", "videos");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, safeFilename);
    fs.writeFileSync(filePath, buffer);

    const localUrl = `/videos/${safeFilename}`;
    return NextResponse.json({
      url: localUrl,
      filename: safeFilename,
      storage: "local-fallback",
    });
  } catch (err) {
    console.error("Video upload error:", err);
    return NextResponse.json({ error: "Failed to upload video to storage" }, { status: 500 });
  }
}
