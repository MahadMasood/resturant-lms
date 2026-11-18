import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/manager/modules — list modules for this tenant (Manager read-only inspection)
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "MANAGER" && session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const modules = await prisma.module.findMany({
    where: { tenantId: session.user.tenantId ?? undefined },
    include: { _count: { select: { questions: true } } },
    orderBy: { orderIndex: "asc" },
  });

  return NextResponse.json(modules.map((m: any) => ({ ...m, questionCount: m._count.questions })));
}

// POST /api/manager/modules — Restricted to Super Admin only
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Strictly enforce Super Admin authority over curriculum and quiz authoring
  if (session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json(
      { error: "Forbidden. Curriculum creation, video media uploads, and quiz authoring are restricted to Super Admin." },
      { status: 403 }
    );
  }

  const body = await req.json();
  const { title, description, videoUrl, tenantId, questions } = body;

  const targetTenantId = tenantId || session.user.tenantId;
  if (!targetTenantId) {
    return NextResponse.json({ error: "Target restaurant venue required" }, { status: 400 });
  }

  if (!title || !videoUrl) {
    return NextResponse.json({ error: "Title and videoUrl required" }, { status: 400 });
  }

  const lastModule = await prisma.module.findFirst({
    where: { tenantId: targetTenantId },
    orderBy: { orderIndex: "desc" },
  });

  const module_ = await prisma.module.create({
    data: {
      tenantId: targetTenantId,
      title: title.trim(),
      description: description?.trim() ?? null,
      videoUrl: videoUrl.trim(),
      orderIndex: (lastModule?.orderIndex ?? 0) + 1,
      questions: questions
        ? {
            create: questions.map((q: { questionText: string; options: string[]; correctAnswer: number }) => ({
              questionText: q.questionText.trim(),
              options: q.options.map((o: string) => o.trim() || "Option"),
              correctAnswer: q.correctAnswer ?? 0,
            })),
          }
        : undefined,
    },
    include: { questions: true },
  });

  return NextResponse.json(module_, { status: 201 });
}
