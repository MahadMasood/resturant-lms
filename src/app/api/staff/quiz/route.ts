import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/staff/quiz?moduleId=xxx — returns questions (no correct answers)
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const moduleId = req.nextUrl.searchParams.get("moduleId");
  if (!moduleId) return NextResponse.json({ error: "moduleId required" }, { status: 400 });

  const questions = await prisma.question.findMany({
    where: { moduleId },
    select: { id: true, questionText: true, options: true }, // correctAnswer NOT sent
  });

  return NextResponse.json(questions);
}

// POST /api/staff/quiz/submit — graded server-side
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "STAFF") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: { moduleId: string; answers: Record<string, number> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { moduleId, answers } = body;
  if (!moduleId || typeof answers !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Verify video was completed before allowing quiz
  const progress = await prisma.watchProgress.findUnique({
    where: { userId_moduleId: { userId: session.user.id, moduleId } },
  });
  if (!progress || progress.watchedSeconds < (progress.durationSeconds || 1) * 0.8) {
    return NextResponse.json({ error: "Must complete 80% of video first" }, { status: 403 });
  }

  // Grade
  const questions = await prisma.question.findMany({ where: { moduleId } });
  if (questions.length === 0) {
    return NextResponse.json({ error: "No questions found" }, { status: 404 });
  }

  let correct = 0;
  for (const q of questions) {
    if (answers[q.id] === q.correctAnswer) correct++;
  }
  const score = Math.round((correct / questions.length) * 100);
  const passed = score >= 90;

  // Save attempt
  const attempt = await prisma.quizAttempt.create({
    data: {
      userId: session.user.id,
      moduleId,
      score,
      passed,
    },
  });

  // If passed — generate certificate (placeholder URL for now; Puppeteer in Phase 4)
  let certificateUrl: string | null = null;
  if (passed) {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    const module_ = await prisma.module.findUnique({ where: { id: moduleId } });
    // Generate cert via internal call
    const certResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/certificates/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: session.user.id,
        moduleId,
        userName: user?.name ?? "Staff",
        moduleName: module_?.title ?? "Module",
        score,
      }),
    });
    if (certResponse.ok) {
      const certData = await certResponse.json();
      certificateUrl = certData.pdfUrl ?? null;
    }
  }

  return NextResponse.json({ score, passed, attemptId: attempt.id, certificateUrl });
}

