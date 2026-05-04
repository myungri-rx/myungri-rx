
import { useState } from "react";

export function Footer() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const account = "3333-17-2528000";
    try {
      await navigator.clipboard.writeText(account);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = account;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="relative z-10 text-center py-8 px-4 mt-16">
      <div className="mx-auto max-w-4xl">
        {/* Donation banner */}
        <div
          className="mb-8 rounded-2xl p-[1px] overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(212,175,55,0.4), rgba(107,33,168,0.4), rgba(212,175,55,0.4))",
          }}
        >
          <div className="rounded-2xl px-6 py-5 bg-surface/90 backdrop-blur-sm">
            <p className="text-lg font-display">
              <span className="text-gradient-gold font-bold">&#x2615;</span>
              <span className="text-text-primary ml-2">
                거지 개발자에게 커피 한 잔의 온기를 나눠주세요
              </span>
            </p>
            <p className="text-xs text-text-secondary/60 mt-1">
              당신의 사주에 <span className="text-accent">재성(財星)</span>이 빛나고 있습니다... 아마도요
            </p>
            <button
              onClick={handleCopy}
              className="mt-3 inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 hover:border-accent/50 hover:shadow-[0_0_15px_rgba(212,175,55,0.2)] active:scale-[0.97]"
            >
              <span className="font-mono tracking-wide">
                카카오뱅크 3333-17-2528000
              </span>
              <span className="text-xs opacity-70">
                {copied ? "✓ 복사됨!" : "복사하기"}
              </span>
            </button>
          </div>
        </div>

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

        {/* Business info */}
        <div className="mt-6 pt-4 border-t border-white/5">
          <p className="text-[10px] leading-relaxed text-text-secondary/25">
            포러베러원(forabetterone) | 대표: 최희슬 | 사업자등록번호: 292-01-03864
            <br />
            서울시 서초구 양재2동 255-4
          </p>
        </div>
      </div>
    </footer>
  );
}
