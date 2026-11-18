import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden. Only Super Admin can access curriculum management." }, { status: 403 });
  }

  const { id } = await params;
  const module_ = await prisma.module.findUnique({
    where: { id },
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
    },
  });

  if (!module_) {
    return NextResponse.json({ error: "Module not found" }, { status: 404 });
  }

  return NextResponse.json(module_);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden. Only Super Admin can edit curriculum modules and quizzes." }, { status: 403 });
  }

  const { id } = await params;
  const existing = await prisma.module.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Module not found" }, { status: 404 });
  }

  const body = await req.json();
  const { title, description, videoUrl, tenantId, questions } = body;

  const updated = await prisma.$transaction(async (tx: any) => {
    const mod = await tx.module.update({
      where: { id },
      data: {
        title: title !== undefined ? title.trim() : existing.title,
        description: description !== undefined ? (description?.trim() || null) : existing.description,
        videoUrl: videoUrl !== undefined ? videoUrl.trim() : existing.videoUrl,
        tenantId: tenantId !== undefined ? tenantId : existing.tenantId,
      },
    });

    if (Array.isArray(questions)) {
      await tx.question.deleteMany({ where: { moduleId: id } });

      if (questions.length > 0) {
        await tx.question.createMany({
          data: questions.map((q: any) => ({
            moduleId: id,
            questionText: q.questionText.trim(),
            options: q.options.map((o: string) => o.trim() || "Option"),
            correctAnswer: q.correctAnswer ?? 0,
          })),
        });
      }
    }

    return mod;
  });

  const full = await prisma.module.findUnique({
    where: { id },
    include: { questions: true, tenant: { select: { id: true, name: true } } },
  });

  return NextResponse.json(full);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden. Only Super Admin can delete curriculum modules." }, { status: 403 });
  }

  const { id } = await params;
  const existing = await prisma.module.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Module not found" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.question.deleteMany({ where: { moduleId: id } }),
    prisma.watchProgress.deleteMany({ where: { moduleId: id } }),
    prisma.quizAttempt.deleteMany({ where: { moduleId: id } }),
    prisma.certificate.deleteMany({ where: { moduleId: id } }),
    prisma.module.delete({ where: { id } }),
  ]);

  return NextResponse.json({ success: true, deletedId: id });
}
