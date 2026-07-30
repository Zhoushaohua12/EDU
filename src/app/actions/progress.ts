"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

export async function submitPracticeAction(lessonId: string, formData: FormData) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { questions: true },
  });

  if (!lesson) {
    return { error: "课时不存在" };
  }

  const details = lesson.questions.map((q) => {
    const raw = String(formData.get(q.id) ?? "");
    const correct = normalize(raw) === normalize(q.answer);
    return {
      questionId: q.id,
      correct,
      expected: q.answer,
      explanation: q.explanation,
    };
  });

  const correctCount = details.filter((d) => d.correct).length;
  const total = details.length || 1;
  const score = Math.round((correctCount / total) * 100);

  const session = await auth();
  if (!session?.user) {
    return { score, total: 100, details, requiresLogin: true };
  }

  await prisma.progress.upsert({
    where: {
      userId_lessonId: {
        userId: session.user.id,
        lessonId,
      },
    },
    update: {
      status: "completed",
      score,
    },
    create: {
      userId: session.user.id,
      lessonId,
      status: "completed",
      score,
    },
  });

  return { score, total: 100, details, requiresLogin: false };
}
