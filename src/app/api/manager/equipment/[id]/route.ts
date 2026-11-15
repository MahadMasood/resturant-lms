import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// PATCH /api/manager/equipment/[id] — update item, increment cooks count (+1 Cook), or change status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "MANAGER" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const existing = await prisma.equipmentItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Equipment item not found" }, { status: 404 });
    }

    // Role-based tenant boundary check
    if (session.user.role === "MANAGER" && existing.tenantId !== session.user.tenantId) {
      return NextResponse.json({ error: "Cross-tenant access forbidden" }, { status: 403 });
    }

    const body = await req.json();

    // 1. Quick Action: Increment Cook Count (+1 or custom)
    if (body.action === "increment_cook") {
      const increment = Math.max(1, parseInt(body.amount, 10) || 1);
      const newCooks = existing.cooksCount + increment;
      const willRetire = newCooks >= existing.maxCooks;

      const updated = await prisma.equipmentItem.update({
        where: { id },
        data: {
          cooksCount: newCooks,
          // If slab reaches or exceeds 40 cooks and wasn't retired, optionally mark or keep active with warning
          status: willRetire && body.autoRetire ? "RETIRED" : existing.status,
          notes: body.notes !== undefined ? body.notes : existing.notes,
        },
      });

      return NextResponse.json({
        success: true,
        item: updated,
        reachedLifespan: newCooks >= existing.maxCooks,
      });
    }

    // 2. Quick Action: Change Status (Retire, Maintenance, Active)
    if (body.action === "set_status") {
      const validStatuses = ["ACTIVE", "MAINTENANCE", "RETIRED"];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }

      const updated = await prisma.equipmentItem.update({
        where: { id },
        data: { status: body.status },
      });

      return NextResponse.json({ success: true, item: updated });
    }

    // 3. Full Update / Field Edits
    const dataToUpdate: any = {};
    if (body.name && typeof body.name === "string") dataToUpdate.name = body.name.trim();
    if (body.type && ["COOKING_PLATE", "METAL_RING", "SERVING_PLATE"].includes(body.type)) {
      dataToUpdate.type = body.type;
    }
    if (body.quantity !== undefined) dataToUpdate.quantity = Math.max(1, parseInt(body.quantity, 10) || 1);
    if (body.cooksCount !== undefined) dataToUpdate.cooksCount = Math.max(0, parseInt(body.cooksCount, 10) || 0);
    if (body.maxCooks !== undefined) dataToUpdate.maxCooks = Math.max(1, parseInt(body.maxCooks, 10) || 40);
    if (body.status && ["ACTIVE", "MAINTENANCE", "RETIRED"].includes(body.status)) {
      dataToUpdate.status = body.status;
    }
    if (body.notes !== undefined) dataToUpdate.notes = body.notes?.trim() || null;

    const updated = await prisma.equipmentItem.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (err: any) {
    console.error("PATCH /api/manager/equipment/[id] error:", err);
    return NextResponse.json({ error: err.message || "Failed to update equipment" }, { status: 500 });
  }
}

// DELETE /api/manager/equipment/[id] — remove equipment item
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "MANAGER" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const existing = await prisma.equipmentItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Equipment item not found" }, { status: 404 });
    }

    if (session.user.role === "MANAGER" && existing.tenantId !== session.user.tenantId) {
      return NextResponse.json({ error: "Cross-tenant access forbidden" }, { status: 403 });
    }

    await prisma.equipmentItem.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/manager/equipment/[id] error:", err);
    return NextResponse.json({ error: err.message || "Failed to delete equipment" }, { status: 500 });
  }
}
