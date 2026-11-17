import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// DELETE /api/manager/staff/[id] — offboard/delete staff member and their training records
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "MANAGER" && session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "User ID required" }, { status: 400 });

  if (id === session.user.id) {
    return NextResponse.json({ error: "You cannot offboard your own account" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
  }

  if (session.user.role === "MANAGER") {
    if (target.tenantId !== session.user.tenantId) {
      return NextResponse.json({ error: "Cross-tenant access forbidden" }, { status: 403 });
    }
    if (target.role !== "STAFF") {
      return NextResponse.json({ error: "Managers can only offboard staff members" }, { status: 403 });
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.watchProgress.deleteMany({ where: { userId: id } });
    await tx.quizAttempt.deleteMany({ where: { userId: id } });
    await tx.certificate.deleteMany({ where: { userId: id } });
    await tx.user.delete({ where: { id } });
  });

  return NextResponse.json({
    success: true,
    message: `Staff member "${target.name}" was offboarded successfully.`,
  });
}
