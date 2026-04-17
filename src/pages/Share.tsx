import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { StarField } from "@/components/effects/star-field";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PersonalResult } from "@/components/results/personal-result";
import { CompatibilityResult } from "@/components/results/compatibility-result";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { SajuAnalysisData } from "@/lib/types";

interface SharedPersonalData {
  type: "personal";
  resultText: string;
  sajuData: SajuAnalysisData;
  concern?: string;
}

interface SharedCompatibilityData {
  type: "compatibility";
  resultText: string;
  person1: SajuAnalysisData;
  person2: SajuAnalysisData;
  relationshipType?: string;
}

type SharedData = SharedPersonalData | SharedCompatibilityData;

export default function Share() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [data, setData] = useState<SharedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setError("공유 링크가 올바르지 않습니다.");
      setLoading(false);
      return;
    }

    fetch(`/api/share?id=${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("결과를 찾을 수 없습니다.");
        return res.json();
      })
      .then((d) => setData(d as SharedData))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <StarField />
      <Header compact />

      <section className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
        {loading && (
          <Card variant="elevated" className="text-center py-12">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent inline-block" />
            <p className="mt-4 text-text-secondary">결과를 불러오는 중...</p>
          </Card>
        )}

        {error && (
          <Card variant="elevated" className="text-center py-12">
            <p className="text-red-400 mb-4">{error}</p>
            <Button variant="dramatic" onClick={() => (window.location.href = "/")}>
              직접 사주 분석하기
            </Button>
          </Card>
        )}

        {data?.type === "personal" && (
          <PersonalResult
            sajuData={data.sajuData} teaserText={data.resultText} fullText=""
            isStreaming={false} concern={data.concern} phase="full-done"
            canLoadMore={false} isLoadingMore={false} onLoadMore={() => {}}
          />
        )}

        {data?.type === "compatibility" && (
          <CompatibilityResult
            person1={data.person1} person2={data.person2}
            teaserText={data.resultText} fullText=""
            isStreaming={false} relationshipType={data.relationshipType} phase="full-done"
            canLoadMore={false} isLoadingMore={false} onLoadMore={() => {}}
          />
        )}
      </section>

      <Footer />
    </div>
  );
}
