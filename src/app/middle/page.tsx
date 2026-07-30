import Link from "next/link";
import { MIDDLE_GRADES, gradeLabel } from "@/lib/curriculum";
import { prisma } from "@/lib/prisma";

export default async function MiddlePage() {
  const subjects = await prisma.subject.findMany({
    where: { stage: "middle" },
    orderBy: [{ grade: "asc" }, { sortOrder: "asc" }],
  });

  return (
    <section className="section">
      <div className="container">
        <div className="crumb">
          <Link href="/">首页</Link>
          <span>/</span>
          <span>初中</span>
        </div>
        <h1 className="section__title">初中 · 人教版</h1>
        <p className="section__desc">
          覆盖语数英及物理、化学、历史、地理、道德与法治等科目入口。
        </p>

        {MIDDLE_GRADES.map((grade) => {
          const gradeSubjects = subjects.filter((s) => s.grade === grade);
          return (
            <div key={grade} style={{ marginBottom: "2rem" }}>
              <h2 className="tile__title" style={{ marginBottom: "0.75rem" }}>
                {gradeLabel(grade)}
              </h2>
              <div className="subject-grid">
                {gradeSubjects.map((subject) => (
                  <Link
                    key={subject.id}
                    className="tile"
                    href={`/g/${grade}/${subject.slug}`}
                  >
                    <h3 className="tile__title">{subject.name}</h3>
                    <p className="tile__meta">查看单元与课时</p>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
