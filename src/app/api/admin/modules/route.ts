import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/modules — List all modules across all venues for Super Admin
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden. Only Super Admin can access curriculum management." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get("tenantId");

  const whereClause: any = {};
  if (tenantId && tenantId !== "ALL") {
    whereClause.tenantId = tenantId;
  }

  const modules = await prisma.module.findMany({
    where: whereClause,
    include: {
      tenant: { select: { id: true, name: true } },
      questions: {
        select: {
          id: true,
          questionText: true,
          options: true,
          correctAnswer: true,
        },
      },
      _count: {
        select: {
          questions: true,
          watchProgress: true,
          certificates: true,
        },
      },
    },
    orderBy: [{ tenantId: "asc" }, { orderIndex: "asc" }],
  });

  return NextResponse.json(
    modules.map((m: any) => ({
      ...m,
      questionCount: m._count.questions,
      completionsCount: m._count.certificates,
    }))
  );
}

// POST /api/admin/modules — Author a new module with video media and quiz questions
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden. Only Super Admin can create curriculum modules." }, { status: 403 });
  }

  const body = await req.json();
  const { title, description, videoUrl, tenantId, questions } = body;

  if (!title || !videoUrl) {
    return NextResponse.json({ error: "Title and videoUrl are required." }, { status: 400 });
  }

  if (!tenantId) {
    return NextResponse.json({ error: "A target restaurant venue must be selected." }, { status: 400 });
  }

  // If "ALL" is selected, create for all tenants
  if (tenantId === "ALL") {
    const allTenants = await prisma.tenant.findMany({ select: { id: true } });
    if (allTenants.length === 0) {
      return NextResponse.json({ error: "No venues available." }, { status: 400 });
    }

    const createdModules = await prisma.$transaction(
      allTenants.map((t: any) =>
        prisma.module.create({
          data: {
            tenantId: t.id,
            title: title.trim(),
            description: description?.trim() || null,
            videoUrl: videoUrl.trim(),
            orderIndex: 0,
            questions: questions && questions.length > 0
              ? {
                  create: questions.map((q: any) => ({
                    questionText: q.questionText.trim(),
                    options: q.options.map((o: string) => o.trim() || "Option"),
                    correctAnswer: q.correctAnswer ?? 0,
                  })),
                }
              : undefined,
          },
          include: { questions: true },
        })
      )
    );

    return NextResponse.json({ success: true, count: createdModules.length }, { status: 201 });
  }

  // Single tenant module creation
  const lastModule = await prisma.module.findFirst({
    where: { tenantId },
    orderBy: { orderIndex: "desc" },
  });

  const newModule = await prisma.module.create({
    data: {
      tenantId,
      title: title.trim(),
      description: description?.trim() || null,
      videoUrl: videoUrl.trim(),
      orderIndex: (lastModule?.orderIndex ?? 0) + 1,
      questions: questions && questions.length > 0
        ? {
            create: questions.map((q: any) => ({
              questionText: q.questionText.trim(),
              options: q.options.map((o: string) => o.trim() || "Option"),
              correctAnswer: q.correctAnswer ?? 0,
            })),
          }
        : undefined,
    },
    include: { questions: true, tenant: { select: { id: true, name: true } } },
  });

  return NextResponse.json(newModule, { status: 201 });
}
