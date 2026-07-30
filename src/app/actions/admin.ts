"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/login");
  }
  return session;
}

const lessonSchema = z.object({
  title: z.string().min(1).max(120),
  summary: z.string().min(1).max(500),
  guide: z.string().min(1),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export async function updateLessonAction(lessonId: string, formData: FormData) {
  await requireAdmin();
  const parsed = lessonSchema.safeParse({
    title: formData.get("title"),
    summary: formData.get("summary"),
    guide: formData.get("guide"),
    sortOrder: formData.get("sortOrder") || 0,
  });
  if (!parsed.success) {
    redirect(`/admin/lessons/${lessonId}?error=` + encodeURIComponent("请检查课时字段"));
  }

  await prisma.lesson.update({
    where: { id: lessonId },
    data: parsed.data,
  });

  revalidatePath(`/lesson/${lessonId}`);
  revalidatePath("/admin");
  redirect(`/admin/lessons/${lessonId}?saved=1`);
}

export async function createQuestionAction(lessonId: string, formData: FormData) {
  await requireAdmin();

  const type = String(formData.get("type") ?? "single");
  const prompt = String(formData.get("prompt") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  const explanation = String(formData.get("explanation") ?? "").trim();
  const optionsRaw = String(formData.get("options") ?? "").trim();

  if (!prompt || !answer || !explanation) {
    redirect(`/admin/lessons/${lessonId}?error=` + encodeURIComponent("题目字段不完整"));
  }

  let options: string | null = null;
  if (type === "single") {
    const list = optionsRaw
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (list.length < 2) {
      redirect(`/admin/lessons/${lessonId}?error=` + encodeURIComponent("单选题至少 2 个选项"));
    }
    options = JSON.stringify(list);
  }

  const maxSort = await prisma.question.aggregate({
    where: { lessonId },
    _max: { sortOrder: true },
  });

  await prisma.question.create({
    data: {
      lessonId,
      type: type === "fill" ? "fill" : "single",
      prompt,
      options,
      answer,
      explanation,
      sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
    },
  });

  revalidatePath(`/lesson/${lessonId}`);
  redirect(`/admin/lessons/${lessonId}?saved=1`);
}

export async function deleteQuestionAction(questionId: string, lessonId: string) {
  await requireAdmin();
  await prisma.question.delete({ where: { id: questionId } });
  revalidatePath(`/lesson/${lessonId}`);
  revalidatePath(`/admin/lessons/${lessonId}`);
}

export async function createLessonAction(formData: FormData) {
  await requireAdmin();
  const unitId = String(formData.get("unitId") ?? "");
  const parsed = lessonSchema.safeParse({
    title: formData.get("title"),
    summary: formData.get("summary"),
    guide: formData.get("guide"),
    sortOrder: formData.get("sortOrder") || 0,
  });
  if (!unitId || !parsed.success) {
    redirect("/admin?error=" + encodeURIComponent("创建课时失败"));
  }

  const lesson = await prisma.lesson.create({
    data: {
      unitId,
      ...parsed.data,
    },
  });

  redirect(`/admin/lessons/${lesson.id}`);
}
