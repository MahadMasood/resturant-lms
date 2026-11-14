import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/manager/modules — list modules for this tenant
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

  return NextResponse.json(modules.map((m) => ({ ...m, questionCount: m._count.questions })));
}

// POST /api/manager/modules — create a new module
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "MANAGER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!session.user.tenantId) return NextResponse.json({ error: "No tenant" }, { status: 400 });

  const body = await req.json();
  const { title, description, videoUrl, questions } = body;

  if (!title || !videoUrl) {
    return NextResponse.json({ error: "title and videoUrl required" }, { status: 400 });
  }

  const lastModule = await prisma.module.findFirst({
    where: { tenantId: session.user.tenantId },
    orderBy: { orderIndex: "desc" },
  });

  const module_ = await prisma.module.create({
    data: {
      tenantId: session.user.tenantId,
      title,
      description: description ?? null,
      videoUrl,
      orderIndex: (lastModule?.orderIndex ?? 0) + 1,
      questions: questions
        ? {
            create: questions.map((q: { questionText: string; options: string[]; correctAnswer: number }) => ({
              questionText: q.questionText,
              options: q.options,
              correctAnswer: q.correctAnswer,
            })),
          }
        : undefined,
    },
    include: { questions: true },
  });

  return NextResponse.json(module_, { status: 201 });
}

