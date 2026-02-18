"use client";

import { DecorativeMoon } from "@/components/effects/decorative-moon";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onStart: () => void;
}

// 12 Earthly Branches for the rotating ring
const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

export function HeroSection({ onStart }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* 12지지 rotating ring */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] md:w-[600px] md:h-[600px]">
        <svg
          viewBox="0 0 600 600"
          className="w-full h-full animate-[spin_120s_linear_infinite] opacity-[0.06]"
        >
          {BRANCHES.map((char, i) => {
            const angle = (i * 30 - 90) * (Math.PI / 180);
            const x = 300 + 270 * Math.cos(angle);
            const y = 300 + 270 * Math.sin(angle);
            return (
              <text
                key={char}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-accent font-display"
                fontSize="28"
              >
                {char}
              </text>
            );
          })}
          {/* Ring circle */}
          <circle
            cx="300"
            cy="300"
            r="270"
            fill="none"
            stroke="rgba(212,175,55,0.3)"
            strokeWidth="0.5"
          />
          <circle
            cx="300"
            cy="300"
            r="240"
            fill="none"
            stroke="rgba(107,33,168,0.2)"
            strokeWidth="0.5"
          />
        </svg>
      </div>

      {/* Constellation lines (decorative SVG) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
      >
        <line x1="200" y1="100" x2="350" y2="250" stroke="#D4AF37" strokeWidth="1" />
        <line x1="350" y1="250" x2="500" y2="200" stroke="#D4AF37" strokeWidth="1" />
        <line x1="500" y1="200" x2="650" y2="350" stroke="#D4AF37" strokeWidth="1" />
        <line x1="650" y1="350" x2="800" y2="300" stroke="#D4AF37" strokeWidth="1" />
        <line x1="100" y1="600" x2="250" y2="750" stroke="#6B21A8" strokeWidth="1" />
        <line x1="250" y1="750" x2="400" y2="700" stroke="#6B21A8" strokeWidth="1" />
        <line x1="700" y1="600" x2="850" y2="700" stroke="#6B21A8" strokeWidth="1" />
        <line x1="850" y1="700" x2="900" y2="850" stroke="#6B21A8" strokeWidth="1" />
        <circle cx="200" cy="100" r="2" fill="#D4AF37" />
        <circle cx="350" cy="250" r="2" fill="#D4AF37" />
        <circle cx="500" cy="200" r="2" fill="#D4AF37" />
        <circle cx="650" cy="350" r="2" fill="#D4AF37" />
        <circle cx="800" cy="300" r="2" fill="#D4AF37" />
        <circle cx="100" cy="600" r="2" fill="#6B21A8" />
        <circle cx="250" cy="750" r="2" fill="#6B21A8" />
        <circle cx="400" cy="700" r="2" fill="#6B21A8" />
        <circle cx="700" cy="600" r="2" fill="#6B21A8" />
        <circle cx="850" cy="700" r="2" fill="#6B21A8" />
        <circle cx="900" cy="850" r="2" fill="#6B21A8" />
      </svg>

      {/* Moon */}
      <DecorativeMoon size="lg" className="mb-8" />

      {/* Title */}
      <h1 className="font-display text-6xl md:text-7xl font-black text-gradient-gold tracking-tight mb-4 relative z-10">
        사주전쟁49
      </h1>

      {/* Subtitle */}
      <p className="text-lg md:text-xl text-text-secondary mb-2 relative z-10">
        30년 전문가가 읽는 당신의 사주
      </p>

      {/* Tagline */}
      <p className="text-sm text-text-secondary/60 font-display mb-10 relative z-10">
        운명을 놓고 펼치는 기의 전쟁
      </p>

      {/* CTA */}
      <Button
        variant="dramatic"
        size="lg"
        onClick={onStart}
        className="relative z-10 text-lg px-10 py-6 h-auto"
      >
        운명 해독 시작
      </Button>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          className="text-text-secondary/40"
        >
          <path
            d="M12 5v14M5 12l7 7 7-7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </section>
  );
}
