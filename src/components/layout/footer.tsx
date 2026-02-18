"use client";

export function Footer() {
  return (
    <footer className="relative z-10 text-center py-8 px-4 mt-16">
      <div className="mx-auto max-w-4xl">
        {/* Gold gradient divider */}
        <div
          className="h-px mb-6"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)",
          }}
        />
        <p className="font-display text-sm text-accent/40">사주전쟁49</p>
        <p className="mt-2 text-xs text-text-secondary/40">
          사주 분석은 전통 명리학에 기반한 참고 정보이며, 과학적 근거와는 다릅니다.
          <br />
          중요한 결정은 전문가 상담과 본인의 판단에 따라 내려주세요.
        </p>
      </div>
    </footer>
  );
}
