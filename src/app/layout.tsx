import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IDF E-Biz 운영 보드 — 인동FN 자사몰 프로모션 일정 관리 & 오픈 사전 점검",
  description: "인동FN 자사몰 프로모션 일정 관리 & 오픈 사전 점검",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
