import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// GET /api/admin/tenants — list all tenants with their managers and staff
export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const tenants = await prisma.tenant.findMany({
    include: {
      _count: { select: { users: true, modules: true } },
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              certificates: true,
              quizAttempts: true,
            },
          },
        },
        orderBy: [{ role: "asc" }, { name: "asc" }],
      },
      equipment: {
        select: {
          id: true,
          name: true,
          type: true,
          cooksCount: true,
          maxCooks: true,
          quantity: true,
          status: true,
          notes: true,
          updatedAt: true,
        },
        orderBy: [{ type: "asc" }, { cooksCount: "desc" }],
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    tenants.map((t: any) => {
      const activeCookingPlates = t.equipment?.filter((e: any) => e.type === "COOKING_PLATE" && e.status !== "RETIRED") ?? [];
      const totalCookingPlates = activeCookingPlates.reduce((sum: number, e: any) => sum + (e.quantity || 1), 0);
      const averagePlateHealth = activeCookingPlates.length > 0
        ? Math.round(
            activeCookingPlates.reduce((sum: number, p: any) => {
              const h = Math.max(0, Math.round(((p.maxCooks - p.cooksCount) / p.maxCooks) * 100));
              return sum + h;
            }, 0) / activeCookingPlates.length
          )
        : 100;

      const totalMetalRings = (t.equipment?.filter((e: any) => e.type === "METAL_RING") ?? [])
        .reduce((sum: number, e: any) => sum + (e.quantity || 1), 0);

      const totalServingPlates = (t.equipment?.filter((e: any) => e.type === "SERVING_PLATE") ?? [])
        .reduce((sum: number, e: any) => sum + (e.quantity || 1), 0);

      const nearDepletedCount = (t.equipment?.filter((e: any) => e.type === "COOKING_PLATE" && e.cooksCount >= 36) ?? []).length;

      return {
        id: t.id,
        name: t.name,
        createdAt: t.createdAt,
        userCount: t._count.users,
        moduleCount: t._count.modules,
        users: t.users.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          createdAt: u.createdAt,
          certificatesCount: u._count?.certificates ?? 0,
          quizAttemptsCount: u._count?.quizAttempts ?? 0,
        })),
        equipment: t.equipment ?? [],
        equipmentSummary: {
          totalCookingPlates,
          averagePlateHealth,
          totalMetalRings,
          totalServingPlates,
          nearDepletedCount,
        },
      };
    })
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
