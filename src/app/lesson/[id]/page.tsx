import Link from "next/link";
import { notFound } from "next/navigation";
import { PracticeForm } from "@/components/PracticeForm";
import { auth } from "@/lib/auth";
import { gradeLabel } from "@/lib/curriculum";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function LessonPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      questions: { orderBy: { sortOrder: "asc" } },
      unit: {
        include: {
          subject: true,
        },
      },
    },
  });

  if (!lesson) notFound();

  const subject = lesson.unit.subject;
  const progress = session?.user
    ? await prisma.progress.findUnique({
        where: {
          userId_lessonId: {
            userId: session.user.id,
            lessonId: lesson.id,
          },
        },
      })
    : null;

  if (session?.user && !progress) {
    await prisma.progress.create({
      data: {
        userId: session.user.id,
        lessonId: lesson.id,
        status: "started",
      },
    });
  }

  return (
    <section className="section">
      <div className="container">
        <div className="crumb">
          <Link href="/">首页</Link>
          <span>/</span>
          <Link href={subject.stage === "primary" ? "/primary" : "/middle"}>
            {subject.stage === "primary" ? "小学" : "初中"}
          </Link>
          <span>/</span>
          <Link href={`/g/${subject.grade}/${subject.slug}`}>
            {gradeLabel(subject.grade)}
            {subject.name}
          </Link>
          <span>/</span>
          <span>{lesson.title}</span>
        </div>

        <h1 className="section__title">{lesson.title}</h1>
        <p className="section__desc">{lesson.summary}</p>

        {progress?.status === "completed" ? (
          <p className="success" style={{ marginBottom: "1.25rem" }}>
            你已完成本课，得分 {progress.score ?? 0} 分。可再次练习刷新成绩。
          </p>
        ) : null}

        {!session?.user ? (
          <p className="panel" style={{ marginBottom: "1.25rem" }}>
            登录后可保存学习进度。
            <Link href="/login" style={{ marginLeft: "0.5rem", color: "var(--bamboo)" }}>
              去登录
            </Link>
          </p>
        ) : null}

        <div className="panel" style={{ marginBottom: "1.5rem" }}>
          <h2 className="tile__title">导学</h2>
          <div className="guide">{lesson.guide}</div>
        </div>

        <div className="panel">
          <h2 className="tile__title">随堂练习</h2>
          <PracticeForm
            lessonId={lesson.id}
            questions={lesson.questions.map((q) => ({
              id: q.id,
              type: q.type,
              prompt: q.prompt,
              options: q.options ? (JSON.parse(q.options) as string[]) : [],
            }))}
          />
        </div>
      </div>
    </section>
  );
}
