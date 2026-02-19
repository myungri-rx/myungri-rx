"use client";

import { useState, useCallback } from "react";
import { calculateFullSaju } from "@/lib/saju/calculator";
import type { SajuInput, SajuAnalysisData } from "@/lib/types";

export function useSajuCompatibility() {
  const [person1Data, setPerson1Data] = useState<SajuAnalysisData | null>(null);
  const [person2Data, setPerson2Data] = useState<SajuAnalysisData | null>(null);
  const [streamedText, setStreamedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (input1: SajuInput, input2: SajuInput, relationshipType: string = "romantic") => {
    setError(null);
    setStreamedText("");
    setPerson1Data(null);
    setPerson2Data(null);
    setIsLoading(true);

    try {
      const data1 = calculateFullSaju(input1);
      const data2 = calculateFullSaju(input2);
      setPerson1Data(data1);
      setPerson2Data(data2);

      const response = await fetch("/api/compatibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ person1: data1, person2: data2, relationshipType }),
      });

      if (!response.ok) {
        throw new Error("궁합 분석 요청에 실패했습니다.");
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
    setPerson1Data(null);
    setPerson2Data(null);
    setStreamedText("");
    setError(null);
    setIsLoading(false);
  }, []);

  return { person1Data, person2Data, streamedText, isLoading, error, analyze, reset };
}
