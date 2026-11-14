import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/staff/modules — returns modules assigned to this staff's tenant with sequential progression
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "STAFF") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { tenantId, id: userId } = session.user;
  if (!tenantId) return NextResponse.json({ error: "No tenant" }, { status: 400 });

  const modules = await prisma.module.findMany({
    where: { tenantId },
    orderBy: { orderIndex: "asc" },
    include: {
      _count: { select: { questions: true } },
      watchProgress: { where: { userId } },
      quizAttempts: { where: { userId }, orderBy: { createdAt: "desc" } },
      certificates: { where: { userId } },
    },
  });

  const result: any[] = [];
  let previousModulePassed = true; // First module is always unlocked

  for (let i = 0; i < modules.length; i++) {
    const m = modules[i];
    const wp = m.watchProgress[0];
    const latestAttempt = m.quizAttempts[0];
    const cert = m.certificates[0];

    const quizPassed = latestAttempt?.passed ?? false;
    const isLocked = !previousModulePassed;

    result.push({
      id: m.id,
      title: m.title,
      description: m.description,
      videoUrl: m.videoUrl,
      orderIndex: m.orderIndex,
      questionCount: m._count.questions,
      watchedSeconds: wp?.watchedSeconds ?? 0,
      durationSeconds: wp?.durationSeconds ?? 0,
      completed: wp?.completed ?? false,
      quizPassed,
      quizScore: latestAttempt?.score ?? null,
      attemptsCount: m.quizAttempts.length,
      certificateUrl: cert?.pdfUrl ?? null,
      isLocked,
      requiredPreviousTitle: i > 0 && isLocked ? modules[i - 1].title : null,
    });

    // Update for next iteration: next module is unlocked only if current module was completed/passed
    previousModulePassed = quizPassed || (wp?.completed ?? false);
  }

  return NextResponse.json(result);
}
