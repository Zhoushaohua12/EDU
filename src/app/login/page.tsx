import Link from "next/link";
import { signInAction } from "@/app/actions/auth";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <section className="section">
      <div className="container">
        <h1 className="section__title">登录课径</h1>
        <p className="section__desc">登录后可保存练习成绩与学习进度。</p>
        {error ? <p className="alert">{error}</p> : null}
        <form className="form" action={signInAction}>
          <label>
            邮箱
            <input name="email" type="email" required placeholder="student@kejing.local" />
          </label>
          <label>
            密码
            <input name="password" type="password" required minLength={6} />
          </label>
          <button className="btn btn-primary" type="submit">
            登录
          </button>
        </form>
        <p className="muted" style={{ marginTop: "1rem" }}>
          还没有账号？<Link href="/register">注册</Link>
        </p>
      </div>
    </section>
  );
}
