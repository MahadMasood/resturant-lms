import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "MANAGER" && session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const tenantId = session.user.tenantId;

  const module_ = await prisma.module.findUnique({
    where: { id },
    include: { questions: true },
  });

  if (!module_) {
    return NextResponse.json({ error: "Module not found" }, { status: 404 });
  }

  if (session.user.role !== "SUPER_ADMIN" && module_.tenantId !== tenantId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(module_);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "MANAGER" && session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const tenantId = session.user.tenantId;

  const existing = await prisma.module.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Module not found" }, { status: 404 });
  }

  if (session.user.role !== "SUPER_ADMIN" && existing.tenantId !== tenantId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { title, description, videoUrl, questions } = body;

  // Transaction to update module and refresh questions if provided
  const updated = await prisma.$transaction(async (tx) => {
    const mod = await tx.module.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existing.title,
        description: description !== undefined ? description : existing.description,
        videoUrl: videoUrl !== undefined ? videoUrl : existing.videoUrl,
      },
    });

    if (Array.isArray(questions)) {
      // Delete old questions and recreate new ones
      await tx.question.deleteMany({ where: { moduleId: id } });
      if (questions.length > 0) {
        await tx.question.createMany({
          data: questions.map((q: { questionText: string; options: string[]; correctAnswer: number }) => ({
            moduleId: id,
            questionText: q.questionText,
            options: q.options,
            correctAnswer: q.correctAnswer,
          })),
        });
      }
    }

    return tx.module.findUnique({
      where: { id },
      include: { questions: true },
    });
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "MANAGER" && session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const tenantId = session.user.tenantId;

  const existing = await prisma.module.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Module not found" }, { status: 404 });
  }

  if (session.user.role !== "SUPER_ADMIN" && existing.tenantId !== tenantId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

