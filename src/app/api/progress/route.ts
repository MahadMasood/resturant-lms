import { NextRequest, NextResponse } from "next/server";
import { getProgress, upsertProgress } from "@/lib/progressStore";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const moduleId = searchParams.get("moduleId") || "module-1";
  const userId = session.user.email ?? "unknown";

  const progress = await getProgress(userId, moduleId);
  return NextResponse.json(progress);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const moduleId = typeof body.moduleId === "string" && body.moduleId.trim().length > 0
    ? body.moduleId
    : "module-1";

  // Parse numerical fields safely with fallbacks
  const rawWatched = Number(body.watchedSeconds);
  const rawMax = Number(body.maxWatchedSeconds);
  const rawDur = Number(body.durationSeconds);

  const watchedSeconds = Number.isFinite(rawWatched) && rawWatched >= 0
    ? Math.round(rawWatched)
    : 0;

  // If maxWatchedSeconds was omitted by older client, fallback to watchedSeconds
  const maxWatchedSeconds = Number.isFinite(rawMax) && rawMax >= 0
    ? Math.round(rawMax)
    : watchedSeconds;

  // If durationSeconds was 0 or unready on client, default to 38 (known duration of module 1)
  const durationSeconds = Number.isFinite(rawDur) && rawDur > 0
    ? Math.round(rawDur)
    : 38;

  const userId = session.user.email ?? "unknown";
  const userName = session.user.name ?? session.user.email ?? "Staff";

  const { record, rejected } = await upsertProgress({
    userId,
    userName,
    moduleId,
    watchedSeconds,
    maxWatchedSeconds,
    durationSeconds,
  });

  if (rejected) {
    return NextResponse.json(
      {
        error: "Skip detected — forward skipping is disabled.",
        lastConfirmedSeconds: record.maxWatchedSeconds,
        record,
      },
      { status: 422 }
    );
  }

  return NextResponse.json(record);
}
