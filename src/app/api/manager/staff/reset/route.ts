import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "MANAGER" && session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const tenantId = session.user.tenantId;

  let body: { userId?: string; moduleId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { userId, moduleId } = body;
  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  // Verify target user belongs to this tenant
  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, tenantId: true },
  });

  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (session.user.role !== "SUPER_ADMIN" && targetUser.tenantId !== tenantId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const whereClause = moduleId
    ? { userId, moduleId }
    : { userId };

  await prisma.$transaction([
    prisma.watchProgress.deleteMany({ where: whereClause }),
    prisma.quizAttempt.deleteMany({ where: whereClause }),
    prisma.certificate.deleteMany({ where: whereClause }),
  ]);

  return NextResponse.json({ success: true, userId, moduleId: moduleId ?? "all" });
}

