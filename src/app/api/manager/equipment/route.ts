import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/manager/equipment — list salt slab equipment and health meters
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Determine tenantId based on role
  let tenantId = session.user.tenantId;
  const urlTenant = req.nextUrl.searchParams.get("tenantId");

  if (session.user.role === "SUPER_ADMIN" && urlTenant) {
    tenantId = urlTenant;
  }

  if (!tenantId) {
    return NextResponse.json({ error: "No venue associated with account" }, { status: 400 });
  }

  try {
    const items = await prisma.equipmentItem.findMany({
      where: { tenantId },
      orderBy: [{ type: "asc" }, { updatedAt: "desc" }],
    });

    // Compute metrics
    const activeCookingPlates = items.filter(
      (e) => e.type === "COOKING_PLATE" && e.status !== "RETIRED"
    );

    const totalCookingPlates = activeCookingPlates.reduce(
      (sum, e) => sum + (e.quantity || 1),
      0
    );

    const averagePlateHealth =
      activeCookingPlates.length > 0
        ? Math.round(
            activeCookingPlates.reduce((sum, p) => {
              const max = p.maxCooks || 40;
              const h = Math.max(0, Math.round(((max - p.cooksCount) / max) * 100));
              return sum + h;
            }, 0) / activeCookingPlates.length
          )
        : 100;

    const totalMetalRings = items
      .filter((e) => e.type === "METAL_RING" && e.status !== "RETIRED")
      .reduce((sum, e) => sum + (e.quantity || 1), 0);

    const totalServingPlates = items
      .filter((e) => e.type === "SERVING_PLATE" && e.status !== "RETIRED")
      .reduce((sum, e) => sum + (e.quantity || 1), 0);

    const nearDepletedCount = items.filter(
      (e) => e.type === "COOKING_PLATE" && e.cooksCount >= 36 && e.status !== "RETIRED"
    ).length;

    const retiredCount = items.filter((e) => e.status === "RETIRED").length;

    return NextResponse.json({
      items,
      stats: {
        totalCookingPlates,
        averagePlateHealth,
        totalMetalRings,
        totalServingPlates,
        nearDepletedCount,
        retiredCount,
      },
    });
  } catch (err: any) {
    console.error("GET /api/manager/equipment error:", err);
    return NextResponse.json({ error: err.message || "Failed to load equipment" }, { status: 500 });
  }
}

// POST /api/manager/equipment — add a new salt cooking slab, metal ring, or serving plate
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "MANAGER" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    let tenantId = session.user.tenantId;

    if (session.user.role === "SUPER_ADMIN" && body.tenantId) {
      tenantId = body.tenantId;
    }

    if (!tenantId) {
      return NextResponse.json({ error: "Tenant ID required" }, { status: 400 });
    }

    const { name, type, quantity, cooksCount, maxCooks, status, notes } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Item name is required" }, { status: 400 });
    }

    const validTypes = ["COOKING_PLATE", "METAL_RING", "SERVING_PLATE"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid type. Must be COOKING_PLATE, METAL_RING, or SERVING_PLATE" },
        { status: 400 }
      );
    }

    const validStatuses = ["ACTIVE", "MAINTENANCE", "RETIRED"];
    const itemStatus = validStatuses.includes(status) ? status : "ACTIVE";

    const newItem = await prisma.equipmentItem.create({
      data: {
        tenantId,
        name: name.trim(),
        type,
        quantity: Math.max(1, parseInt(quantity, 10) || 1),
        cooksCount: Math.max(0, parseInt(cooksCount, 10) || 0),
        maxCooks: Math.max(1, parseInt(maxCooks, 10) || 40),
        status: itemStatus,
        notes: notes?.trim() || null,
      },
    });

    return NextResponse.json({ success: true, item: newItem }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/manager/equipment error:", err);
    return NextResponse.json({ error: err.message || "Failed to create equipment" }, { status: 500 });
  }
}
