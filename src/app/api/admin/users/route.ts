import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

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

// POST /api/admin/users — Super Admin only: provision co-managers or staff to any venue
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { name?: string; email?: string; password?: string; role?: string; tenantId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, email, password, role, tenantId } = body;
  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: "Name, email, password, and role are required" }, { status: 400 });
  }

  const validRoles = ["SUPER_ADMIN", "MANAGER", "STAFF"];
  if (!validRoles.includes(role)) {
    return NextResponse.json({ error: "Invalid role. Must be SUPER_ADMIN, MANAGER, or STAFF" }, { status: 400 });
  }

  if (role !== "SUPER_ADMIN" && !tenantId) {
    return NextResponse.json({ error: "Restaurant venue selection is required for Manager or Staff" }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email address already exists" }, { status: 409 });
  }

  if (tenantId) {
    const tenantExists = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenantExists) {
      return NextResponse.json({ error: "Selected restaurant venue does not exist" }, { status: 404 });
    }
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const newUser = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: role as "SUPER_ADMIN" | "MANAGER" | "STAFF",
      tenantId: role === "SUPER_ADMIN" ? null : tenantId,
    },
    include: {
      tenant: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(
    {
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        tenantId: newUser.tenantId,
        tenantName: newUser.tenant?.name || "Platform Central",
      },
    },
    { status: 201 }
  );
}
