import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// DELETE /api/admin/tenants/[id] — super admin only: cascades delete all modules, users, certificates
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Tenant ID required" }, { status: 400 });

  // Prevent deleting protected system tenant if needed
  const tenant = await prisma.tenant.findUnique({ where: { id } });
  if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    // 1. Delete all watch progress for users in this tenant
    const users = await tx.user.findMany({ where: { tenantId: id }, select: { id: true } });
    const userIds = users.map((u: { id: string }) => u.id);

    if (userIds.length > 0) {
      await tx.watchProgress.deleteMany({ where: { userId: { in: userIds } } });
      await tx.quizAttempt.deleteMany({ where: { userId: { in: userIds } } });
      await tx.certificate.deleteMany({ where: { userId: { in: userIds } } });
    }

    // 2. Delete questions for modules in this tenant
    const modules = await tx.module.findMany({ where: { tenantId: id }, select: { id: true } });
    const moduleIds = modules.map((m: { id: string }) => m.id);

    if (moduleIds.length > 0) {
      await tx.question.deleteMany({ where: { moduleId: { in: moduleIds } } });
      await tx.module.deleteMany({ where: { id: { in: moduleIds } } });
    }

    // 3. Delete users in this tenant
    await tx.user.deleteMany({ where: { tenantId: id } });

    // 4. Delete equipment in this tenant
    await tx.equipmentItem.deleteMany({ where: { tenantId: id } });

    // 5. Delete tenant
    await tx.tenant.delete({ where: { id } });
  });

  return NextResponse.json({ success: true, message: `Tenant "${tenant.name}" deleted successfully.` });
}
