import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

const ALLOWED_MIME_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

const ALLOWED_EXTENSIONS = new Set([".mp4", ".webm", ".mov"]);
const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100MB limit

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "MANAGER" && session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 1. File Size Validation (prevent memory exhaustion DoS)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File exceeds 100MB maximum upload limit. Please use Cloudflare R2 for larger files." },
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
    const uploadDir = path.join(process.cwd(), "public", "videos");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, safeFilename);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/videos/${safeFilename}`;
    return NextResponse.json({
      url: publicUrl,
      filename: safeFilename,
      storage: "local-fallback",
      note: "Development fallback. Production deployments should use Cloudflare R2 / Stream.",
    });
  } catch (err) {
    console.error("Video upload error:", err);
    return NextResponse.json({ error: "Failed to upload video" }, { status: 500 });
  }
}

