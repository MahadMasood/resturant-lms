import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

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

  // 4. Generate Certificate if Passed
  let certificateUrl: string | null = null;
  if (passed) {
    const existingCert = await prisma.certificate.findUnique({
      where: { userId_moduleId: { userId: session.user.id, moduleId } },
    });

    if (existingCert) {
      certificateUrl = existingCert.pdfUrl;
    } else {
      const user = await prisma.user.findUnique({ where: { id: session.user.id } });
      const moduleRecord = await prisma.module.findUnique({ where: { id: moduleId } });

      const userName = user?.name || "Staff Member";
      const moduleName = moduleRecord?.title || "Food Safety Protocols";
      const issuedAt = new Date();
      const dateStr = issuedAt.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const certId = `CERT-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Certificate of Accreditation — ${userName}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #09090b; color: #18181b; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; margin: 0; }
  .controls { margin-bottom: 24px; display: flex; gap: 12px; }
  .print-btn { background: #0071e3; color: white; border: none; padding: 10px 24px; border-radius: 9999px; font-size: 13px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 14px rgba(0, 113, 227, 0.4); }
  .cert-container { background: #ffffff; width: 100%; max-width: 860px; padding: 64px 72px; border-radius: 28px; box-shadow: 0 25px 70px rgba(0,0,0,0.45); position: relative; overflow: hidden; }
  .emblem { display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 14px; background: #09090b; color: #ffffff; margin-bottom: 16px; font-weight: bold; }
  .title { font-size: 36px; font-weight: 700; color: #09090b; letter-spacing: -0.02em; margin-top: 12px; }
  .recipient-name { font-size: 32px; font-weight: 700; color: #0071e3; margin: 16px 0; }
  .score-badge { display: inline-block; padding: 4px 16px; background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; border-radius: 9999px; font-size: 13px; font-weight: 600; }
</style>
</head>
<body>
  <div class="controls"><button onclick="window.print()" class="print-btn">Print / Save PDF</button></div>
  <div class="cert-container" style="text-align: center;">
    <div class="emblem">&#10003;</div>
    <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; color: #71717a; font-weight: 700;">Hospitality Compliance Council</div>
    <div class="title">Certificate of Accreditation</div>
    <p style="color: #71717a; margin-top: 16px;">This officially certifies that</p>
    <div class="recipient-name">${userName}</div>
    <p style="color: #3f3f46; max-width: 580px; margin: 0 auto; line-height: 1.6;">
      has successfully completed all anti-cheat verified video training and achieved passing accreditation in <strong>${moduleName}</strong>.
    </p>
    <div style="margin: 28px 0;"><span class="score-badge">Evaluation Score: ${score}% (Passed)</span></div>
    <div style="border-top: 1px solid #e4e4e7; padding-top: 20px; font-size: 12px; color: #71717a; display: flex; justify-content: space-between;">
      <span>Date Issued: ${dateStr}</span>
      <span>Verification ID: ${certId}</span>
    </div>
  </div>
</body>
</html>`;

      const certDir = path.join(process.cwd(), "public", "certificates");
      if (!fs.existsSync(certDir)) fs.mkdirSync(certDir, { recursive: true });

      const certFilename = `cert-${session.user.id}-${moduleId}.html`;
      fs.writeFileSync(path.join(certDir, certFilename), html, "utf-8");

      certificateUrl = `/certificates/${certFilename}`;

      await prisma.certificate.create({
        data: {
          userId: session.user.id,
          moduleId,
          pdfUrl: certificateUrl,
          issuedAt,
        },
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
