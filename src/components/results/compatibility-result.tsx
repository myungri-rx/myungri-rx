
import { useEffect } from "react";
import { PillarTable } from "./pillar-table";
import { CompatibilityRadar } from "./compatibility-radar";
import { StreamingText } from "./streaming-text";
import { SectionCard } from "./section-card";
import { ShareBar } from "./share-bar";
import { Card } from "@/components/ui/card";
import { useRevealSequence } from "@/hooks/use-reveal-sequence";
import type { SajuAnalysisData, AnalysisPhase } from "@/lib/types";
import { parseCompatibilityScores } from "@/lib/utils/parse-sections";

interface CompatibilityResultProps {
  person1: SajuAnalysisData;
  person2: SajuAnalysisData;
  teaserText: string;
  fullText: string;
  isStreaming: boolean;
  relationshipType?: string;
  phase: AnalysisPhase;
  canLoadMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}

export function CompatibilityResult({
  person1, person2, teaserText, fullText, isStreaming, relationshipType,
  phase, canLoadMore, isLoadingMore, onLoadMore,
}: CompatibilityResultProps) {
  const scores = parseCompatibilityScores(teaserText + fullText);

  const { visibleCount, startReveal } = useRevealSequence({
    totalSections: 4,
    intervalMs: 500,
  });

  useEffect(() => {
    startReveal();
  }, [startReveal]);

  const isFullDone = phase === "full-done";

  return (
    <div className="space-y-6">
      {/* Both pillar tables with VS divider */}
      {visibleCount >= 1 && (
        <div
          className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-start animate-slide-up"
          style={{ animationFillMode: "backwards" }}
        >
          <SectionCard title={`${person1.input.name}의 사주`}>
            <PillarTable
              pillars={person1.fourPillars}
              pillarsHanja={person1.fourPillarsHanja}
              tenGods={person1.tenGods}
              twelveStages={person1.twelveStages}
            />
          </SectionCard>

          <div className="hidden md:flex items-center justify-center self-center">
            <span className="font-display text-3xl font-bold text-accent">VS</span>
          </div>
          <div className="md:hidden flex items-center justify-center gap-4 py-2">
            <div
              className="h-px flex-1"
              style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.3))" }}
            />
            <span className="font-display text-xl font-bold text-accent">VS</span>
            <div
              className="h-px flex-1"
              style={{ background: "linear-gradient(90deg, rgba(212,175,55,0.3), transparent)" }}
            />
          </div>

          <SectionCard title={`${person2.input.name}의 사주`}>
            <PillarTable
              pillars={person2.fourPillars}
              pillarsHanja={person2.fourPillarsHanja}
              tenGods={person2.tenGods}
              twelveStages={person2.twelveStages}
            />
          </SectionCard>
        </div>
      )}

      {/* Radar chart */}
      {visibleCount >= 2 && scores && (
        <SectionCard title="궁합 레이더" delay={200}>
          <CompatibilityRadar
            data={scores.dimensions}
            totalScore={scores.total}
          />
        </SectionCard>
      )}

      {/* Streamed AI Analysis — single card, teaser + full */}
      {visibleCount >= 3 && (teaserText || isStreaming) && (
        <Card
          variant="elevated"
          className="animate-slide-up"
          style={{ animationDelay: "400ms", animationFillMode: "backwards" }}
        >
          <StreamingText
            content={fullText ? teaserText + "\n\n" + fullText : teaserText}
            isStreaming={phase === "teaser-streaming" || phase === "full-streaming"}
          />

          {canLoadMore && !isLoadingMore && (
            <div className="relative mt-4">
              <div className="absolute -top-16 left-0 right-0 h-16 bg-gradient-to-t from-[#1E293B] to-transparent pointer-events-none" />
              <div className="text-center py-6 border-t border-white/[0.08]">
                <p className="text-sm text-text-secondary mb-3">
                  갈등 주의보, 시기별 타임라인, 관계 처방전이 궁금하다면?
                </p>
                <button
                  onClick={onLoadMore}
                  className="relative px-8 py-3 rounded-xl text-base font-medium bg-gradient-to-r from-primary via-primary-light to-primary text-white border border-accent/40 shadow-[0_0_20px_rgba(212,175,55,0.15)] hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:border-accent/70 active:scale-[0.98] transition-all duration-300"
                >
                  전체 궁합 분석 잠금해제 · 1,650원
                </button>
                <p className="mt-2 text-xs text-text-secondary/70">
                  결제 후 보기
                </p>
              </div>
            </div>
          )}

          {isLoadingMore && (
            <div className="text-center py-6 border-t border-white/[0.08]">
              <span className="inline-flex items-center gap-2 text-accent animate-pulse">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                상세 분석을 생성하고 있어요...
              </span>
            </div>
          )}

          {isFullDone && (teaserText || fullText) && (
            <>
              <div className="mt-6 pt-4 border-t border-white/[0.08] text-xs text-text-secondary/50 text-center">
                궁합 점수는 절대적 판단이 아닌 관계 개선의 가이드입니다.
              </div>
              <ShareBar
                resultText={teaserText + "\n\n" + fullText}
                shareData={{
                  type: "compatibility",
                  resultText: teaserText + "\n\n" + fullText,
                  person1,
                  person2,
                  relationshipType,
                }}
              />
            </>
          )}
        </Card>
      )}
    </div>
  );
}
