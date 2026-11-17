import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/progress/all — manager/super-admin only
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = session.user.role;
  if (role !== "MANAGER" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const queryTenantId = req.nextUrl.searchParams.get("tenantId");
  const tenantId =
    role === "SUPER_ADMIN"
      ? (queryTenantId || session.user.tenantId)
      : session.user.tenantId;

  if (!tenantId && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Tenant ID required" }, { status: 400 });
  }

  const whereClause: { role: "STAFF"; tenantId?: string } = { role: "STAFF" };
  if (tenantId) {
    whereClause.tenantId = tenantId;
  }

  // Fetch all staff in this tenant with their progress and quiz attempts
  const users = await prisma.user.findMany({
    where: whereClause,
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

  const result = users.map((u: any) => ({
    userId: u.id,
    name: u.name,
    email: u.email,
    progress: u.watchProgress.map((wp: any) => ({
      moduleId: wp.moduleId,
      moduleTitle: wp.module.title,
      watchedSeconds: wp.watchedSeconds,
      durationSeconds: wp.durationSeconds,
      completed: wp.completed,
      percent: wp.durationSeconds > 0 ? Math.round((wp.watchedSeconds / wp.durationSeconds) * 100) : 0,
    })),
    quizAttempts: u.quizAttempts.map((qa: any) => ({
      moduleId: qa.moduleId,
      score: qa.score,
      passed: qa.passed,
      createdAt: qa.createdAt,
    })),
    certificates: u.certificates.map((c: any) => ({
      moduleId: c.moduleId,
      pdfUrl: c.pdfUrl,
      issuedAt: c.issuedAt,
    })),
  }));

  return NextResponse.json(result);
}
