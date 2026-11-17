import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/staff/quiz?moduleId=xxx
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const moduleId = req.nextUrl.searchParams.get("moduleId");
  if (!moduleId) return NextResponse.json({ error: "moduleId required" }, { status: 400 });

  const [module_, questions, pastAttempts] = await Promise.all([
    prisma.module.findUnique({
      where: { id: moduleId },
      select: { id: true, title: true, description: true },
    }),
    prisma.question.findMany({
      where: { moduleId },
      select: { id: true, questionText: true, options: true },
    }),
    prisma.quizAttempt.findMany({
      where: { userId: session.user.id, moduleId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, score: true, passed: true, createdAt: true },
    }),
  ]);

  if (!module_) {
    return NextResponse.json({ error: "Module not found" }, { status: 404 });
  }

  return NextResponse.json({
    module: module_,
    questions,
    pastAttempts,
  });
}

// POST /api/staff/quiz — evaluated server-side
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "STAFF") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: { moduleId?: string; answers?: Record<string, number> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { moduleId, answers } = body;
  if (!moduleId || typeof answers !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // 1. Verify video completion threshold (at least 80% watched)
  const progress = await prisma.watchProgress.findUnique({
    where: { userId_moduleId: { userId: session.user.id, moduleId } },
  });

  const duration = progress?.durationSeconds || 38;
  const watched = progress?.watchedSeconds || 0;

  if (!progress || watched < duration * 0.8) {
    return NextResponse.json(
      { error: "Anti-cheat: You must verify at least 80% of the training video before evaluation." },
      { status: 403 }
    );
  }

  // 2. Fetch ground-truth questions from DB
  const questions = await prisma.question.findMany({ where: { moduleId } });
  if (questions.length === 0) {
    return NextResponse.json({ error: "No questions configured for this module" }, { status: 404 });
  }

  let correctCount = 0;
  const missedQuestionIds: string[] = [];

  for (const q of questions) {
    const userAnswer = answers[q.id];
    if (userAnswer === q.correctAnswer) {
      correctCount++;
    } else {
      missedQuestionIds.push(q.id);
    }
  }

  const score = Math.round((correctCount / questions.length) * 100);
  const passed = score >= 90; // Strict 90% compliance threshold

  // 3. Save attempt record
  const attempt = await prisma.quizAttempt.create({
    data: {
      userId: session.user.id,
      moduleId,
      score,
      passed,
    },
  });

  // 4. Generate Digital Certificate if Passed
  let certificateUrl: string | null = null;
  if (passed) {
    const existingCert = await prisma.certificate.findUnique({
      where: { userId_moduleId: { userId: session.user.id, moduleId } },
    });

    if (existingCert) {
      certificateUrl = existingCert.pdfUrl.startsWith("/certificates/")
        ? existingCert.pdfUrl
        : `/certificates/${existingCert.id}`;
    } else {
      const issuedAt = new Date();
      const newCert = await prisma.certificate.create({
        data: {
          userId: session.user.id,
          moduleId,
          pdfUrl: `/certificates/${session.user.id}-${moduleId}`,
          issuedAt,
        },
      });

      certificateUrl = `/certificates/${newCert.id}`;
      await prisma.certificate.update({
        where: { id: newCert.id },
        data: { pdfUrl: certificateUrl },
      });
    }
  }

  return NextResponse.json({
    score,
    passed,
    correctCount,
    totalQuestions: questions.length,
    missedQuestionIds,
    attemptId: attempt.id,
    certificateUrl,
  });
}
