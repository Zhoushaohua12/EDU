import Link from "next/link";
import { redirect } from "next/navigation";
import {
  createQuestionAction,
  deleteQuestionAction,
  updateLessonAction,
} from "@/app/actions/admin";
import { auth } from "@/lib/auth";
import { gradeLabel } from "@/lib/curriculum";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
};

export default async function AdminLessonPage({ params, searchParams }: Props) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/login");

  const { id } = await params;
  const { error, saved } = await searchParams;

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      questions: { orderBy: { sortOrder: "asc" } },
      unit: { include: { subject: true } },
    },
  });

  if (!lesson) redirect("/admin");

  const subject = lesson.unit.subject;

  return (
    <section className="section">
      <div className="container">
        <div className="crumb">
          <Link href="/admin">管理</Link>
          <span>/</span>
          <span>{lesson.title}</span>
        </div>
        <h1 className="section__title">编辑课时</h1>
        <p className="section__desc">
          {gradeLabel(subject.grade)}
          {subject.name} · {lesson.unit.title}
        </p>
        {error ? <p className="alert">{error}</p> : null}
        {saved ? <p className="success">已保存</p> : null}

        <div className="panel" style={{ marginBottom: "1.5rem" }}>
          <form
            className="form"
            action={updateLessonAction.bind(null, lesson.id)}
            style={{ maxWidth: "100%" }}
          >
            <label>
              标题
              <input name="title" defaultValue={lesson.title} required />
            </label>
            <label>
              摘要
              <input name="summary" defaultValue={lesson.summary} required />
            </label>
            <label>
              导学
              <textarea name="guide" defaultValue={lesson.guide} required />
            </label>
            <label>
              排序
              <input name="sortOrder" type="number" defaultValue={lesson.sortOrder} />
            </label>
            <button className="btn btn-primary" type="submit">
              保存课时
            </button>
          </form>
        </div>

        <div className="panel" style={{ marginBottom: "1.5rem" }}>
          <h2 className="tile__title">已有题目</h2>
          {lesson.questions.length === 0 ? (
            <p className="muted">暂无题目</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>题干</th>
                  <th>类型</th>
                  <th>答案</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {lesson.questions.map((q) => (
                  <tr key={q.id}>
                    <td>{q.prompt}</td>
                    <td>{q.type === "single" ? "单选" : "填空"}</td>
                    <td>{q.answer}</td>
                    <td>
                      <form action={deleteQuestionAction.bind(null, q.id, lesson.id)}>
                        <button type="submit" className="btn btn-ghost" style={{ padding: "0.35rem 0.8rem" }}>
                          删除
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="panel">
          <h2 className="tile__title">添加题目</h2>
          <form
            className="form"
            action={createQuestionAction.bind(null, lesson.id)}
            style={{ maxWidth: "100%", marginTop: "0.75rem" }}
          >
            <label>
              题型
              <select name="type" defaultValue="single">
                <option value="single">单选</option>
                <option value="fill">填空</option>
              </select>
            </label>
            <label>
              题干
              <input name="prompt" required />
            </label>
            <label>
              选项（单选，每行一个）
              <textarea name="options" placeholder={"选项A\n选项B\n选项C"} />
            </label>
            <label>
              答案
              <input name="answer" required />
            </label>
            <label>
              解析
              <textarea name="explanation" required />
            </label>
            <button className="btn btn-primary" type="submit">
              添加题目
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
