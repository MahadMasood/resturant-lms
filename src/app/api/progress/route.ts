import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/progress?moduleId=xxx
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const moduleId = req.nextUrl.searchParams.get("moduleId");
  if (!moduleId) return NextResponse.json({ error: "moduleId required" }, { status: 400 });

  const record = await prisma.watchProgress.findUnique({
    where: { userId_moduleId: { userId: session.user.id, moduleId } },
  });

  const watched = record?.watchedSeconds ?? 0;
  const dur = record?.durationSeconds ?? 0;
  const percentWatched = dur > 0 ? Math.round((watched / dur) * 100) : 0;

  return NextResponse.json({
    watchedSeconds: watched,
    maxWatchedSeconds: watched,
    durationSeconds: dur,
    percentWatched,
    completed: record?.completed ?? false,
  });
}

// POST /api/progress
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const moduleId = typeof body.moduleId === "string" ? body.moduleId : null;
  const watchedSeconds = Number(body.watchedSeconds);
  const durationSeconds = Number(body.durationSeconds) || 38;
  const maxWatchedSeconds = Number(body.maxWatchedSeconds ?? body.watchedSeconds);

  if (!moduleId || !Number.isFinite(watchedSeconds)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Anti-skip: load existing high-water mark
  const existing = await prisma.watchProgress.findUnique({
    where: { userId_moduleId: { userId: session.user.id, moduleId } },
  });

  const storedMax = existing?.watchedSeconds ?? 0;
  const TOLERANCE = 12; // seconds of network jitter allowance

  if (maxWatchedSeconds > storedMax + TOLERANCE) {
    return NextResponse.json(
      {
        error: "Skip detected",
        lastConfirmedSeconds: storedMax,
      },
      { status: 422 }
    );
  }

  const newMax = Math.max(storedMax, watchedSeconds);
  const completed = newMax >= durationSeconds * 0.95;

  const record = await prisma.watchProgress.upsert({
    where: { userId_moduleId: { userId: session.user.id, moduleId } },
    update: {
      watchedSeconds: newMax,
      durationSeconds,
      completed,
    },
    create: {
      userId: session.user.id,
      moduleId,
      watchedSeconds: newMax,
      durationSeconds,
      completed,
    },
  });

  return NextResponse.json({ ok: true, watchedSeconds: record.watchedSeconds, completed });
}
