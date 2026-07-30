import type { Metadata } from "next";
import { Noto_Sans_SC, Noto_Serif_SC } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { auth } from "@/lib/auth";
import "./globals.css";

const sans = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sans",
});

const serif = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "课径｜人教版小学初中同步学习",
  description: "按人教版学段体系学习语文、数学、英语等科目，支持练习与学习进度。",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="zh-CN" className={`${sans.variable} ${serif.variable}`}>
      <body>
        <SiteHeader
          user={
            session?.user
              ? {
                  name: session.user.name ?? "同学",
                  role: session.user.role,
                }
              : null
          }
        />
        <main>{children}</main>
        <footer className="site-footer">
          <div className="container">
            课径 · 人教版同步学习。电子教材 PDF 来自
            <a
              href="https://github.com/Zhoushaohua12/ChinaTextbook"
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginLeft: "0.35rem", color: "var(--bamboo)" }}
            >
              ChinaTextbook
            </a>
            ，请依法合规使用。
          </div>
        </footer>
      </body>
    </html>
  );
}
