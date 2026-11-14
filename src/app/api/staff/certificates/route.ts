import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/staff/certificates
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "STAFF") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const certs = await prisma.certificate.findMany({
    where: { userId: session.user.id },
    include: { module: { select: { title: true } } },
    orderBy: { issuedAt: "desc" },
  });

  return NextResponse.json(
    certs.map((c: any) => ({
      id: c.id,
      moduleId: c.moduleId,
      moduleName: c.module.title,
      pdfUrl: c.pdfUrl,
      issuedAt: c.issuedAt,
    }))
  );
}

