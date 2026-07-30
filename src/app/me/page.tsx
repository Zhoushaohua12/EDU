import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { gradeLabel } from "@/lib/curriculum";
import { prisma } from "@/lib/prisma";

export default async function MePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const progress = await prisma.progress.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      lesson: {
        include: {
          unit: {
            include: { subject: true },
          },
        },
      },
    },
  });

  const completed = progress.filter((p) => p.status === "completed").length;

  return (
    <section className="section">
      <div className="container">
        <h1 className="section__title">我的进度</h1>
        <p className="section__desc">
          你好，{session.user.name}。已完成 {completed} 课，共记录 {progress.length} 条学习轨迹。
        </p>

        <div className="progress-list">
          {progress.length === 0 ? (
            <div className="panel">
              还没有学习记录。去
              <Link href="/primary" style={{ color: "var(--bamboo)", margin: "0 0.25rem" }}>
                小学
              </Link>
              或
              <Link href="/middle" style={{ color: "var(--bamboo)", margin: "0 0.25rem" }}>
                初中
              </Link>
              开始吧。
            </div>
          ) : (
            progress.map((item) => {
              const subject = item.lesson.unit.subject;
              return (
                <Link key={item.id} href={`/lesson/${item.lessonId}`} className="tile">
                  <h3 className="tile__title">{item.lesson.title}</h3>
                  <p className="tile__meta">
                    {gradeLabel(subject.grade)}
                    {subject.name} · {item.lesson.unit.title}
                  </p>
                  <p className="tile__meta">
                    {item.status === "completed" ? `已完成 · ${item.score ?? 0} 分` : "学习中"}
                  </p>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
