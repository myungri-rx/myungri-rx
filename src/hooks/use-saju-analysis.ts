
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

    const now = Date.now();
    if (now - lastUpdate >= THROTTLE_MS) {
      onChunk(accumulated);
      lastUpdate = now;
    }
  }

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

  const saveFullHistory = useCallback(
    async (params: {
      input: SajuInput;
      concern: string | undefined;
      data: SajuAnalysisData;
      teaser: string;
      full: string;
      orderId: string;
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
            type: "personal",
            data: payload,
            phase: "full",
            orderId: params.orderId,
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

      await streamResponse(response, setTeaserText);
      setPhase("teaser-done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
      setPhase("idle");
    }
  }, []);

  const loadMore = useCallback(
    async (orderId: string, override?: { sajuData: SajuAnalysisData; teaserText: string; concern?: string; input: SajuInput }) => {
      const data = override?.sajuData ?? sajuData;
      const teaser = override?.teaserText ?? teaserText;
      const concern = override?.concern ?? lastConcern;
      const input = override?.input ?? lastInput;
      if (!data || !input) return;

      setError(null);
      setPhase("full-streaming");

      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sajuData: data,
            concern,
            mode: "full",
            teaserContent: teaser,
            orderId,
          }),
        });

        if (!response.ok) {
          throw new Error("상세 분석 요청에 실패했습니다.");
        }

        const finalFull = await streamResponse(response, setFullText);
        setPhase("full-done");

        const savedId = await saveFullHistory({
          input,
          concern,
          data,
          teaser,
          full: finalFull,
          orderId,
        });
        if (savedId) setHistoryId(savedId);
      } catch (e) {
        setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
        setPhase("teaser-done");
      }
    },
    [sajuData, teaserText, lastConcern, lastInput, saveFullHistory],
  );

  const restoreTeaserFromOrder = useCallback(
    (payload: { input: SajuInput; sajuData: SajuAnalysisData; concern?: string; teaserText: string }) => {
      setError(null);
      setSajuData(payload.sajuData);
      setTeaserText(payload.teaserText);
      setFullText("");
      setLastInput(payload.input);
      setLastConcern(payload.concern);
      setHistoryId(null);
      setPhase("teaser-done");
    },
    [],
  );

  const restoreAndLoadFull = useCallback(
    (orderId: string, payload: { input: SajuInput; sajuData: SajuAnalysisData; concern?: string; teaserText: string }) => {
      restoreTeaserFromOrder(payload);
      void loadMore(orderId, payload);
    },
    [restoreTeaserFromOrder, loadMore],
  );

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
    historyId,
    lastInput,
    lastConcern,
    analyze,
    loadMore,
    restoreTeaserFromOrder,
    restoreAndLoadFull,
    reset,
    restore,
  };
}
