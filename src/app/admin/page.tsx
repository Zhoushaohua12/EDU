import Link from "next/link";
import { redirect } from "next/navigation";
import { createLessonAction } from "@/app/actions/admin";
import { auth } from "@/lib/auth";
import { gradeLabel } from "@/lib/curriculum";
import { prisma } from "@/lib/prisma";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/login");

  const { error } = await searchParams;

  const units = await prisma.unit.findMany({
    orderBy: [{ subject: { grade: "asc" } }, { sortOrder: "asc" }],
    include: {
      subject: true,
      lessons: {
        orderBy: { sortOrder: "asc" },
        include: { _count: { select: { questions: true } } },
      },
    },
  });

  return (
    <section className="section">
      <div className="container">
        <h1 className="section__title">内容管理</h1>
        <p className="section__desc">编辑课时导学与题目。仅管理员可访问。</p>
        {error ? <p className="alert">{error}</p> : null}

        <div className="panel" style={{ marginBottom: "1.5rem" }}>
          <h2 className="tile__title">新建课时</h2>
          <form className="form" action={createLessonAction} style={{ maxWidth: "100%", marginTop: "0.75rem" }}>
            <label>
              所属单元
              <select name="unitId" required>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {gradeLabel(unit.subject.grade)}
                    {unit.subject.name} · {unit.title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              标题
              <input name="title" required />
            </label>
            <label>
              摘要
              <input name="summary" required />
            </label>
            <label>
              导学内容
              <textarea name="guide" required placeholder="支持纯文本要点" />
            </label>
            <label>
              排序
              <input name="sortOrder" type="number" defaultValue={1} />
            </label>
            <button className="btn btn-primary" type="submit">
              创建课时
            </button>
          </form>
        </div>

        <div className="panel">
          <h2 className="tile__title">课时列表</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>课时</th>
                <th>科目单元</th>
                <th>题目数</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {units.flatMap((unit) =>
                unit.lessons.map((lesson) => (
                  <tr key={lesson.id}>
                    <td>{lesson.title}</td>
                    <td className="muted">
                      {gradeLabel(unit.subject.grade)}
                      {unit.subject.name} · {unit.title}
                    </td>
                    <td>{lesson._count.questions}</td>
                    <td>
                      <Link href={`/admin/lessons/${lesson.id}`} style={{ color: "var(--bamboo)" }}>
                        编辑
                      </Link>
                    </td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
