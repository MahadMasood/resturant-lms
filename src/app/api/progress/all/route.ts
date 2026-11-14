import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/progress/all — manager/super-admin only
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = session.user.role;
  if (role !== "MANAGER" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const tenantId = session.user.tenantId;

  // Fetch all staff in this tenant with their progress and quiz attempts
  const users = await prisma.user.findMany({
    where: {
      tenantId: tenantId ?? undefined,
      role: "STAFF",
    },
    include: {
      watchProgress: {
        include: { module: { select: { title: true } } },
      },
      quizAttempts: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      certificates: true,
    },
  });

  const result = users.map((u) => ({
    userId: u.id,
    name: u.name,
    email: u.email,
    progress: u.watchProgress.map((wp) => ({
      moduleId: wp.moduleId,
      moduleTitle: wp.module.title,
      watchedSeconds: wp.watchedSeconds,
      durationSeconds: wp.durationSeconds,
      completed: wp.completed,
      percent: wp.durationSeconds > 0 ? Math.round((wp.watchedSeconds / wp.durationSeconds) * 100) : 0,
    })),
    quizAttempts: u.quizAttempts.map((qa) => ({
      moduleId: qa.moduleId,
      score: qa.score,
      passed: qa.passed,
      createdAt: qa.createdAt,
    })),
    certificates: u.certificates.map((c) => ({
      moduleId: c.moduleId,
      pdfUrl: c.pdfUrl,
      issuedAt: c.issuedAt,
    })),
  }));

  return NextResponse.json(result);
}
