import Link from "next/link";
import { registerAction } from "@/app/actions/auth";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function RegisterPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <section className="section">
      <div className="container">
        <h1 className="section__title">注册课径</h1>
        <p className="section__desc">创建学生账号，开始记录你的学习路径。</p>
        {error ? <p className="alert">{error}</p> : null}
        <form className="form" action={registerAction}>
          <label>
            昵称
            <input name="name" required placeholder="同学昵称" />
          </label>
          <label>
            邮箱
            <input name="email" type="email" required />
          </label>
          <label>
            密码
            <input name="password" type="password" required minLength={6} />
          </label>
          <button className="btn btn-primary" type="submit">
            注册并登录
          </button>
        </form>
        <p className="muted" style={{ marginTop: "1rem" }}>
          已有账号？<Link href="/login">登录</Link>
        </p>
      </div>
    </section>
  );
}
