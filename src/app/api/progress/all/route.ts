import { NextResponse } from "next/server";
import { getAllProgress } from "@/lib/progressStore";
import { auth } from "@/auth";
import type { UserRole } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  const role = (session?.user as { role?: UserRole } | undefined)?.role;

  if (!session?.user || (role !== "MANAGER" && role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const records = await getAllProgress();
  return NextResponse.json(records);
}
