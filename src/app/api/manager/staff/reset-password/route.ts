import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// POST /api/manager/staff/reset-password — manager/admin resets staff password
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "MANAGER" && session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { userId?: string; newPassword?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { userId, newPassword } = body;
  if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (session.user.role === "MANAGER") {
    if (target.tenantId !== session.user.tenantId) {
      return NextResponse.json({ error: "Cross-tenant access forbidden" }, { status: 403 });
    }
    if (target.role !== "STAFF") {
      return NextResponse.json({ error: "Managers can only reset passwords for staff" }, { status: 403 });
    }
  }

  const passwordToSet = newPassword?.trim() || "Salt2026!";
  if (passwordToSet.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(passwordToSet, 12);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  return NextResponse.json({
    success: true,
    message: `Password reset successfully for ${target.name}.`,
    temporaryPassword: passwordToSet,
  });
}
