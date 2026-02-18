"use client";

import { useState, useEffect } from "react";
import { DecorativeMoon } from "./decorative-moon";

const LOADING_MESSAGES = [
  "사주 원국을 해독하고 있습니다...",
  "십신의 배치를 분석합니다...",
  "대운의 흐름을 읽고 있습니다...",
  "운명의 전쟁이 시작됩니다...",
];

interface AnalysisLoadingProps {
  isVisible: boolean;
}

export function AnalysisLoading({ isVisible }: AnalysisLoadingProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setMessageIndex(0);
      setProgress(0);
      return;
    }

    const msgInterval = setInterval(() => {
      setMessageIndex((prev) =>
        prev < LOADING_MESSAGES.length - 1 ? prev + 1 : prev,
      );
    }, 2000);

    const progInterval = setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + 2 : prev));
    }, 150);

    return () => {
      clearInterval(msgInterval);
      clearInterval(progInterval);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-8 px-8">
        <DecorativeMoon size="md" className="animate-pulse-glow" />

        <p className="font-display text-lg text-accent-light text-center min-h-[2rem] transition-opacity duration-500">
          {LOADING_MESSAGES[messageIndex]}
        </p>

        <div className="w-64 h-1 bg-white/[0.08] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
