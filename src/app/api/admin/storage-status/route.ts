import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { S3Client, HeadBucketCommand } from "@aws-sdk/client-s3";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let r2Endpoint = process.env.R2_ENDPOINT?.trim();
  if (r2Endpoint && !r2Endpoint.startsWith("http")) {
    r2Endpoint = `https://${r2Endpoint}`;
  }
  r2Endpoint = r2Endpoint?.replace(/\/+$/, "");

  const r2AccessKey = process.env.R2_ACCESS_KEY_ID?.trim();
  const r2SecretKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const r2Bucket = process.env.R2_BUCKET_NAME?.trim();
  const r2PublicUrl = process.env.R2_PUBLIC_URL?.trim()?.replace(/\/+$/, "");

  if (!r2Endpoint || !r2AccessKey || !r2SecretKey || !r2Bucket) {
    return NextResponse.json({
      configured: false,
      connected: false,
      provider: "Local Disk Storage",
      message: "Cloudflare R2 credentials not fully defined in .env",
    });
  }

  try {
    const s3 = new S3Client({
      region: "auto",
      endpoint: r2Endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: r2AccessKey,
        secretAccessKey: r2SecretKey,
      },
    });

    await s3.send(new HeadBucketCommand({ Bucket: r2Bucket }));

    return NextResponse.json({
      configured: true,
      connected: true,
      provider: "Cloudflare R2",
      bucket: r2Bucket,
      publicUrl: r2PublicUrl || `${r2Endpoint}/${r2Bucket}`,
      message: "Connected to Cloudflare R2 storage bucket",
    });
  } catch (err: unknown) {
    return NextResponse.json({
      configured: true,
      connected: false,
      provider: "Cloudflare R2",
      bucket: r2Bucket,
      error: err instanceof Error ? err.message : "Error verifying R2 bucket",
    });
  }
}
