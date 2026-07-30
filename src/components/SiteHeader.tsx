import Link from "next/link";
import { signOutAction } from "@/app/actions/auth";

type Props = {
  user: { name: string; role: "student" | "admin" } | null;
};

export function SiteHeader({ user }: Props) {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link href="/" className="brand">
          <span className="brand__mark">课径</span>
          <span className="brand__sub">人教版同步</span>
        </Link>
        <nav className="nav">
          <Link href="/primary">小学</Link>
          <Link href="/middle">初中</Link>
          {user ? (
            <>
              <Link href="/me">我的进度</Link>
              {user.role === "admin" ? <Link href="/admin">管理</Link> : null}
              <span className="muted">{user.name}</span>
              <form action={signOutAction}>
                <button type="submit">退出</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">登录</Link>
              <Link href="/register">注册</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
