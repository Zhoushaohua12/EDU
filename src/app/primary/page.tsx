import Link from "next/link";
import { PRIMARY_GRADES, PRIMARY_SUBJECTS, gradeLabel } from "@/lib/curriculum";
import { prisma } from "@/lib/prisma";

export default async function PrimaryPage() {
  const subjects = await prisma.subject.findMany({
    where: { stage: "primary" },
    orderBy: [{ grade: "asc" }, { sortOrder: "asc" }],
  });

  return (
    <section className="section">
      <div className="container">
        <div className="crumb">
          <Link href="/">首页</Link>
          <span>/</span>
          <span>小学</span>
        </div>
        <h1 className="section__title">小学 · 人教版</h1>
        <p className="section__desc">
          选择年级进入科目。电子教材 PDF 来自 ChinaTextbook 人教/统编目录。
        </p>

        {PRIMARY_GRADES.map((grade) => {
          const gradeSubjects = subjects.filter((s) => s.grade === grade);
          return (
            <div key={grade} style={{ marginBottom: "2rem" }}>
              <h2 className="tile__title" style={{ marginBottom: "0.75rem" }}>
                {gradeLabel(grade)}
              </h2>
              <div className="subject-grid">
                {(gradeSubjects.length ? gradeSubjects : PRIMARY_SUBJECTS.map((s) => ({
                  id: `${grade}-${s.slug}`,
                  slug: s.slug,
                  name: s.name,
                  grade,
                }))).map((subject) => (
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
