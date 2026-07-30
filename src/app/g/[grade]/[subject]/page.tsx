import Link from "next/link";
import { notFound } from "next/navigation";
import { gradeLabel, stageFromGrade } from "@/lib/curriculum";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ grade: string; subject: string }>;
};

export default async function SubjectPage({ params }: Props) {
  const { grade: gradeRaw, subject: slug } = await params;
  const grade = Number(gradeRaw);
  if (!Number.isInteger(grade) || grade < 1 || grade > 9) notFound();

  const stage = stageFromGrade(grade);
  const subject = await prisma.subject.findUnique({
    where: { stage_grade_slug: { stage, grade, slug } },
    include: {
      units: {
        orderBy: { sortOrder: "asc" },
        include: {
          lessons: { orderBy: { sortOrder: "asc" } },
        },
      },
    },
  });

  if (!subject) notFound();

  return (
    <section className="section">
      <div className="container">
        <div className="crumb">
          <Link href="/">首页</Link>
          <span>/</span>
          <Link href={stage === "primary" ? "/primary" : "/middle"}>
            {stage === "primary" ? "小学" : "初中"}
          </Link>
          <span>/</span>
          <span>
            {gradeLabel(grade)}
            {subject.name}
          </span>
        </div>
        <h1 className="section__title">
          {gradeLabel(grade)} · {subject.name}
        </h1>
        <p className="section__desc">
          人教/统编电子教材按上册、下册排列，点击进入可打开 ChinaTextbook 仓库中的 PDF。
        </p>

        <div className="unit-list">
          {subject.units.length === 0 ? (
            <div className="panel">该科目暂未匹配到教材 PDF，请稍后通过目录刷新脚本更新。</div>
          ) : (
            subject.units.map((unit) => (
              <div key={unit.id} className="panel">
                <h2 className="tile__title">{unit.title}</h2>
                <div>
                  {unit.lessons.map((lesson) => (
                    <Link key={lesson.id} href={`/lesson/${lesson.id}`} className="lesson-link">
                      <div>
                        <strong>{lesson.title}</strong>
                        <p className="tile__meta">{lesson.summary}</p>
                      </div>
                      <span className="muted">
                        {lesson.sourceUrl ? "打开教材 →" : "开始学习 →"}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
