import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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

  let r2Endpoint = process.env.R2_ENDPOINT?.trim();
  if (r2Endpoint && !r2Endpoint.startsWith("http")) {
    r2Endpoint = `https://${r2Endpoint}`;
  }
  r2Endpoint = r2Endpoint?.replace(/\/+$/, "");

  const r2AccessKey = process.env.R2_ACCESS_KEY_ID?.trim();
  const r2SecretKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const r2Bucket = process.env.R2_BUCKET_NAME?.trim();

  // Check if Cloudflare R2 is configured
  if (!r2Endpoint || !r2AccessKey || !r2SecretKey || !r2Bucket) {
    return NextResponse.json(
      { configured: false, message: "Cloudflare R2 storage not configured. Using local direct upload." },
      { status: 200 }
    );
  }

  let body: { filename?: string; contentType?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { filename, contentType } = body;
  if (!filename || !contentType) {
    return NextResponse.json({ error: "filename and contentType required" }, { status: 400 });
  }

  const ALLOWED_MIME_TYPES = [
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-msvideo",
    "video/ogg",
  ];
  if (!ALLOWED_MIME_TYPES.includes(contentType.toLowerCase())) {
    return NextResponse.json(
      { error: "Invalid video format. Allowed MIME types: video/mp4, video/webm, video/quicktime" },
      { status: 400 }
    );
  }

  try {
    // Cloudflare R2 requires forcePathStyle: true
    const s3 = new S3Client({
      region: "auto",
      endpoint: r2Endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: r2AccessKey,
        secretAccessKey: r2SecretKey,
      },
    });

    const tenantFolder = session.user.tenantId || "admin";
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
    const key = `${tenantFolder}/videos/${Date.now()}-${sanitizedFilename}`;

    const command = new PutObjectCommand({
      Bucket: r2Bucket,
      Key: key,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    const baseUrl = (process.env.R2_PUBLIC_URL || `${r2Endpoint}/${r2Bucket}`).trim().replace(/\/+$/, "");
    const publicUrl = `${baseUrl}/${key}`;

    return NextResponse.json({
      configured: true,
      presignedUrl,
      publicUrl,
      key,
      provider: "Cloudflare R2",
      bucket: r2Bucket,
    });
  } catch (err) {
    console.error("Cloudflare R2 Presigned URL error:", err);
    return NextResponse.json({ error: "Failed to generate presigned upload URL" }, { status: 500 });
  }
}
