import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/users — Super Admin only: list all managers and staff across all venues
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = req.nextUrl;
  const tenantId = searchParams.get("tenantId");
  const role = searchParams.get("role");

  const whereClause: any = {};
  if (tenantId && tenantId !== "ALL") {
    whereClause.tenantId = tenantId;
  }
  if (role && (role === "MANAGER" || role === "STAFF" || role === "SUPER_ADMIN")) {
    whereClause.role = role;
  }

  const users = await prisma.user.findMany({
    where: whereClause,
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
    include: {
      tenant: { select: { id: true, name: true } },
      _count: {
        select: {
          certificates: true,
          quizAttempts: true,
          watchProgress: true,
        },
      },
    },
  });

  return NextResponse.json(
    users.map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      tenantId: u.tenantId,
      tenantName: u.tenant?.name || (u.role === "SUPER_ADMIN" ? "Platform Central" : "Unassigned"),
      createdAt: u.createdAt,
      certificatesCount: u._count.certificates,
      quizAttemptsCount: u._count.quizAttempts,
      watchCount: u._count.watchProgress,
    }))
  );
}
