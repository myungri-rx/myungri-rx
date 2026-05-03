
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

export interface CompatibilityHistoryData {
  person1: SajuAnalysisData;
  person2: SajuAnalysisData;
  relationshipType: string;
  teaserText: string;
  fullText: string;
}

export function useSajuCompatibility() {
  const [person1Data, setPerson1Data] = useState<SajuAnalysisData | null>(null);
  const [person2Data, setPerson2Data] = useState<SajuAnalysisData | null>(null);
  const [teaserText, setTeaserText] = useState("");
  const [fullText, setFullText] = useState("");
  const [phase, setPhase] = useState<AnalysisPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [lastRelType, setLastRelType] = useState<string>("romantic");
  const [historyId, setHistoryId] = useState<string | null>(null);
  const { user } = useAuth();

  const streamedText = useMemo(() => teaserText + fullText, [teaserText, fullText]);
  const isLoading = phase === "teaser-streaming" || phase === "full-streaming";
  const canLoadMore = phase === "teaser-done";

  const saveFullHistory = useCallback(
    async (params: {
      p1: SajuAnalysisData;
      p2: SajuAnalysisData;
      relType: string;
      teaser: string;
      full: string;
      orderId: string;
    }) => {
      if (!user) return null;
      try {
        const payload: CompatibilityHistoryData = {
          person1: params.p1,
          person2: params.p2,
          relationshipType: params.relType,
          teaserText: params.teaser,
          fullText: params.full,
        };
        const res = await fetch("/api/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            type: "compatibility",
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

  const analyze = useCallback(async (input1: SajuInput, input2: SajuInput, relationshipType: string = "romantic") => {
    setError(null);
    setTeaserText("");
    setFullText("");
    setPerson1Data(null);
    setPerson2Data(null);
    setPhase("teaser-streaming");
    setLastRelType(relationshipType);
    setHistoryId(null);

    try {
      const data1 = calculateFullSaju(input1);
      const data2 = calculateFullSaju(input2);
      setPerson1Data(data1);
      setPerson2Data(data2);

      const response = await fetch("/api/compatibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ person1: data1, person2: data2, relationshipType, mode: "teaser" }),
      });

      if (!response.ok) {
        throw new Error("궁합 분석 요청에 실패했습니다.");
      }

      await streamResponse(response, setTeaserText);
      setPhase("teaser-done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
      setPhase("idle");
    }
  }, []);

  const loadMore = useCallback(
    async (
      orderId: string,
      override?: {
        person1: SajuAnalysisData;
        person2: SajuAnalysisData;
        relationshipType: string;
        teaserText: string;
      },
    ) => {
      const p1 = override?.person1 ?? person1Data;
      const p2 = override?.person2 ?? person2Data;
      const relType = override?.relationshipType ?? lastRelType;
      const teaser = override?.teaserText ?? teaserText;
      if (!p1 || !p2) return;

      setError(null);
      setPhase("full-streaming");

      try {
        const response = await fetch("/api/compatibility", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            person1: p1,
            person2: p2,
            relationshipType: relType,
            mode: "full",
            teaserContent: teaser,
            orderId,
          }),
        });

        if (!response.ok) {
          throw new Error("상세 궁합 분석 요청에 실패했습니다.");
        }

        const finalFull = await streamResponse(response, setFullText);
        setPhase("full-done");

        const savedId = await saveFullHistory({
          p1,
          p2,
          relType,
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
    [person1Data, person2Data, lastRelType, teaserText, saveFullHistory],
  );

  const restoreTeaserFromOrder = useCallback(
    (payload: {
      person1: SajuAnalysisData;
      person2: SajuAnalysisData;
      relationshipType: string;
      teaserText: string;
    }) => {
      setError(null);
      setPerson1Data(payload.person1);
      setPerson2Data(payload.person2);
      setTeaserText(payload.teaserText);
      setFullText("");
      setLastRelType(payload.relationshipType);
      setHistoryId(null);
      setPhase("teaser-done");
    },
    [],
  );

  const restoreAndLoadFull = useCallback(
    (
      orderId: string,
      payload: {
        person1: SajuAnalysisData;
        person2: SajuAnalysisData;
        relationshipType: string;
        teaserText: string;
      },
    ) => {
      restoreTeaserFromOrder(payload);
      void loadMore(orderId, payload);
    },
    [restoreTeaserFromOrder, loadMore],
  );

  const reset = useCallback(() => {
    setPerson1Data(null);
    setPerson2Data(null);
    setTeaserText("");
    setFullText("");
    setPhase("idle");
    setError(null);
    setHistoryId(null);
  }, []);

  const restore = useCallback((record: CompatibilityHistoryData, id: string) => {
    setError(null);
    setPerson1Data(record.person1);
    setPerson2Data(record.person2);
    setTeaserText(record.teaserText);
    setFullText(record.fullText || "");
    setLastRelType(record.relationshipType);
    setHistoryId(id);
    setPhase(record.fullText ? "full-done" : "teaser-done");
  }, []);

  return {
    person1Data,
    person2Data,
    streamedText,
    teaserText,
    fullText,
    isLoading,
    error,
    phase,
    canLoadMore,
    historyId,
    lastRelType,
    analyze,
    loadMore,
    restoreTeaserFromOrder,
    restoreAndLoadFull,
    reset,
    restore,
  };
}
