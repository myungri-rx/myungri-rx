import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "사주전쟁49 — 사주명리 분석",
  description: "30년 전문가가 읽는 당신의 사주 — 운명을 놓고 펼치는 기의 전쟁",
  openGraph: {
    title: "사주전쟁49 — 사주명리 분석",
    description: "30년 전문가가 읽는 당신의 사주 — 운명을 놓고 펼치는 기의 전쟁",
    siteName: "사주전쟁49",
  },
  twitter: {
    title: "사주전쟁49 — 사주명리 분석",
    description: "30년 전문가가 읽는 당신의 사주 — 운명을 놓고 펼치는 기의 전쟁",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased" style={{ backgroundColor: "#0F172A", color: "#F8FAFC" }}>
        {children}
        <Script
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
