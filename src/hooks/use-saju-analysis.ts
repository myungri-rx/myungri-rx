
import { useState, useCallback, useMemo } from "react";
import { calculateFullSaju } from "@/lib/saju/calculator";
import type { SajuInput, SajuAnalysisData, AnalysisPhase } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";

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

export interface PersonalHistoryData {
  input: SajuInput;
  concern?: string;
  sajuData: SajuAnalysisData;
  teaserText: string;
  fullText: string;
}

export function useSajuAnalysis() {
  const [sajuData, setSajuData] = useState<SajuAnalysisData | null>(null);
  const [teaserText, setTeaserText] = useState("");
  const [fullText, setFullText] = useState("");
  const [phase, setPhase] = useState<AnalysisPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [lastConcern, setLastConcern] = useState<string | undefined>();
  const [lastInput, setLastInput] = useState<SajuInput | null>(null);
  const [historyId, setHistoryId] = useState<string | null>(null);
  const { user } = useAuth();

  const streamedText = useMemo(() => teaserText + fullText, [teaserText, fullText]);
  const isLoading = phase === "teaser-streaming" || phase === "full-streaming";
  const canLoadMore = phase === "teaser-done";

  const saveHistory = useCallback(
    async (params: {
      input: SajuInput;
      concern: string | undefined;
      data: SajuAnalysisData;
      teaser: string;
      full: string;
      phase: "teaser" | "full";
      existingId: string | null;
    }) => {
      if (!user) return null;
      try {
        const payload: PersonalHistoryData = {
          input: params.input,
          concern: params.concern,
          sajuData: params.data,
          teaserText: params.teaser,
          fullText: params.full,
        };
        const res = await fetch("/api/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            id: params.existingId,
            type: "personal",
            data: payload,
            phase: params.phase,
          }),
        });
        if (!res.ok) return null;
        const json = (await res.json()) as { id: string };
        return json.id;
      } catch (e) {
        console.warn("history save failed", e);
        return null;
      }
    },
    [user],
  );

  const analyze = useCallback(async (input: SajuInput, concern?: string) => {
    setError(null);
    setTeaserText("");
    setFullText("");
    setSajuData(null);
    setPhase("teaser-streaming");
    setLastConcern(concern);
    setLastInput(input);
    setHistoryId(null);

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

      const finalText = await streamResponse(response, setTeaserText);
      setPhase("teaser-done");

      const savedId = await saveHistory({
        input,
        concern,
        data,
        teaser: finalText,
        full: "",
        phase: "teaser",
        existingId: null,
      });
      if (savedId) setHistoryId(savedId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
      setPhase("idle");
    }
  }, [saveHistory]);

  const loadMore = useCallback(async () => {
    if (!sajuData || phase !== "teaser-done") return;

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

      const finalFull = await streamResponse(response, setFullText);
      setPhase("full-done");

      if (lastInput) {
        await saveHistory({
          input: lastInput,
          concern: lastConcern,
          data: sajuData,
          teaser: teaserText,
          full: finalFull,
          phase: "full",
          existingId: historyId,
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
      setPhase("teaser-done");
    }
  }, [sajuData, phase, lastConcern, teaserText, lastInput, historyId, saveHistory]);

  const reset = useCallback(() => {
    setSajuData(null);
    setTeaserText("");
    setFullText("");
    setPhase("idle");
    setError(null);
    setLastConcern(undefined);
    setLastInput(null);
    setHistoryId(null);
  }, []);

  const restore = useCallback((record: PersonalHistoryData, id: string) => {
    setError(null);
    setSajuData(record.sajuData);
    setTeaserText(record.teaserText);
    setFullText(record.fullText || "");
    setLastInput(record.input);
    setLastConcern(record.concern);
    setHistoryId(id);
    setPhase(record.fullText ? "full-done" : "teaser-done");
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
    restore,
  };
}
