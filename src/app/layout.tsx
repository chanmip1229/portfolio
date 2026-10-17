import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IDF E-Biz 운영 보드 — 인동FN 자사몰 프로모션 일정 관리 & 오픈 사전 점검",
  description: "인동FN 자사몰 프로모션 일정 관리 & 오픈 사전 점검 (SHESMISS · LIST · SISTINA)",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#111111",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col bg-[#F8F8FA] text-[#111111] antialiased selection:bg-[#B69F76]/20 selection:text-[#111111]">
        {children}
      </body>
    </html>
  );
}
