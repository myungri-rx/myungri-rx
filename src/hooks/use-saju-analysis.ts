"use client";

import { useState, useCallback } from "react";
import { calculateFullSaju } from "@/lib/saju/calculator";
import type { SajuInput, SajuAnalysisData } from "@/lib/types";

export function useSajuAnalysis() {
  const [sajuData, setSajuData] = useState<SajuAnalysisData | null>(null);
  const [streamedText, setStreamedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (input: SajuInput, concern?: string) => {
    setError(null);
    setStreamedText("");
    setIsLoading(true);

    try {
      const data = calculateFullSaju(input);
      setSajuData(data);

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sajuData: data, concern }),
      });

      if (!response.ok) {
        throw new Error("분석 요청에 실패했습니다.");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("스트리밍을 시작할 수 없습니다.");

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setStreamedText(accumulated);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setSajuData(null);
    setStreamedText("");
    setError(null);
    setIsLoading(false);
  }, []);

  return { sajuData, streamedText, isLoading, error, analyze, reset };
}
