import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "명리처방전 — AI 사주 분석",
  description: "AI 기반 사주 명리 분석 및 궁합 서비스",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
