
import { useState, useCallback, useMemo } from "react";
import { calculateFullSaju } from "@/lib/saju/calculator";
import type { SajuInput, SajuAnalysisData, AnalysisPhase } from "@/lib/types";

async function streamResponse(
  response: Response,
  onChunk: (accumulated: string) => void,
): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("스트리밍을 시작할 수 없습니다.");

  const decoder = new TextDecoder();
  let accumulated = "";
  let lastUpdate = 0;
  const THROTTLE_MS = 50;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    accumulated += chunk;

    // Throttle React updates to prevent render overload
    const now = Date.now();
    if (now - lastUpdate >= THROTTLE_MS) {
      onChunk(accumulated);
      lastUpdate = now;
    }
  }

  // Final update with complete text
  onChunk(accumulated);
  return accumulated;
}

export function useSajuAnalysis() {
  const [sajuData, setSajuData] = useState<SajuAnalysisData | null>(null);
  const [teaserText, setTeaserText] = useState("");
  const [fullText, setFullText] = useState("");
  const [phase, setPhase] = useState<AnalysisPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [lastConcern, setLastConcern] = useState<string | undefined>();

  const streamedText = useMemo(() => teaserText + fullText, [teaserText, fullText]);
  const isLoading = phase === "teaser-streaming" || phase === "full-streaming";
  const canLoadMore = phase === "teaser-done";

  const analyze = useCallback(async (input: SajuInput, concern?: string) => {
    setError(null);
    setTeaserText("");
    setFullText("");
    setSajuData(null);
    setPhase("teaser-streaming");
    setLastConcern(concern);

    try {
      const data = calculateFullSaju(input);
      setSajuData(data);

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sajuData: data, concern, mode: "teaser" }),
      });

      if (!response.ok) {
        throw new Error("분석 요청에 실패했습니다.");
      }

      await streamResponse(response, setTeaserText);
      setPhase("teaser-done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
      setPhase("idle");
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!sajuData || phase !== "teaser-done") return;

    // FUTURE: const hasAccess = await checkPaymentStatus();
    // if (!hasAccess) { showPaywall(); return; }

    setError(null);
    setPhase("full-streaming");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sajuData,
          concern: lastConcern,
          mode: "full",
          teaserContent: teaserText,
        }),
      });

      if (!response.ok) {
        throw new Error("상세 분석 요청에 실패했습니다.");
      }

      await streamResponse(response, setFullText);
      setPhase("full-done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
      setPhase("teaser-done");
    }
  }, [sajuData, phase, lastConcern, teaserText]);

  const reset = useCallback(() => {
    setSajuData(null);
    setTeaserText("");
    setFullText("");
    setPhase("idle");
    setError(null);
    setLastConcern(undefined);
  }, []);

  return {
    sajuData,
    streamedText,
    teaserText,
    fullText,
    isLoading,
    error,
    phase,
    canLoadMore,
    analyze,
    loadMore,
    reset,
  };
}
