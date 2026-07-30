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
            课径 · 人教版同步导学与练习。内容为原创学习指引，不收录教材原文。
          </div>
        </footer>
      </body>
    </html>
  );
}
