import { NextRequest, NextResponse } from "next/server";
import { updateQuizScore } from "@/lib/progressStore";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const moduleId = typeof body.moduleId === "string" ? body.moduleId : "module-1";
  const score = Number(body.score);

  if (!Number.isFinite(score) || score < 0 || score > 100) {
    return NextResponse.json({ error: "Score must be between 0 and 100" }, { status: 400 });
  }

  const userId = session.user.email ?? "unknown";
  const record = await updateQuizScore(userId, moduleId, Math.round(score));

  return NextResponse.json(record);
}

