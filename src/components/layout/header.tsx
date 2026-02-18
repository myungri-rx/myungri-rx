"use client";

export function Header() {
  return (
    <header className="text-center py-8 px-4">
      <h1 className="text-3xl md:text-4xl font-bold">
        <span className="text-accent">명리</span>
        <span className="text-text-primary">처방전</span>
      </h1>
      <p className="mt-2 text-text-secondary text-sm">
        AI 기반 사주 명리 분석 — 당신의 고민에 명리학이 처방을 내립니다
      </p>
    </header>
  );
}
