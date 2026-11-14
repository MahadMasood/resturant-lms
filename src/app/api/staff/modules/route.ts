import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/staff/modules — returns modules assigned to this staff's tenant
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "STAFF") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { tenantId, id: userId } = session.user;
  if (!tenantId) return NextResponse.json({ error: "No tenant" }, { status: 400 });

  const modules = await prisma.module.findMany({
    where: { tenantId },
    orderBy: { orderIndex: "asc" },
    include: {
      watchProgress: { where: { userId } },
      quizAttempts: { where: { userId }, orderBy: { createdAt: "desc" }, take: 1 },
      certificates: { where: { userId } },
    },
  });

  const result = modules.map((m) => {
    const wp = m.watchProgress[0];
    const qa = m.quizAttempts[0];
    const cert = m.certificates[0];
    return {
      id: m.id,
      title: m.title,
      description: m.description,
      videoUrl: m.videoUrl,
      watchedSeconds: wp?.watchedSeconds ?? 0,
      durationSeconds: wp?.durationSeconds ?? 0,
      completed: wp?.completed ?? false,
      quizPassed: qa?.passed ?? false,
      quizScore: qa?.score ?? null,
      certificateUrl: cert?.pdfUrl ?? null,
    };
  });

  return NextResponse.json(result);
}

