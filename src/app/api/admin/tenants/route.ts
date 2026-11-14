import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// GET /api/admin/tenants — list all tenants
export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const tenants = await prisma.tenant.findMany({
    include: { _count: { select: { users: true, modules: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    tenants.map((t: { id: string; name: string; createdAt: Date; _count: { users: number; modules: number } }) => ({
      id: t.id,
      name: t.name,
      createdAt: t.createdAt,
      userCount: t._count.users,
      moduleCount: t._count.modules,
    }))
  );
}

// POST /api/admin/tenants — create a new restaurant + manager account
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { tenantName, managerName, managerEmail, managerPassword } = body;

  if (!tenantName || !managerName || !managerEmail || !managerPassword) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: managerEmail } });
  if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 409 });

  const passwordHash = await bcrypt.hash(managerPassword, 12);

  const tenant = await prisma.tenant.create({
    data: {
      name: tenantName,
      users: {
        create: {
          email: managerEmail,
          passwordHash,
          name: managerName,
          role: "MANAGER",
        },
      },
    },
    include: { users: true },
  });

  return NextResponse.json({ tenantId: tenant.id, tenantName: tenant.name }, { status: 201 });
}

