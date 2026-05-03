
import { useEffect } from "react";
import { PillarTable } from "./pillar-table";
import { FiveElementsChart } from "./five-elements-chart";
import { DaeunTimeline } from "./daeun-timeline";
import { WarningBadge } from "./warning-badge";
import { StreamingText } from "./streaming-text";
import { SectionCard } from "./section-card";
import { ShareBar } from "./share-bar";
import { Card } from "@/components/ui/card";
import { useRevealSequence } from "@/hooks/use-reveal-sequence";
import type { SajuAnalysisData, AnalysisPhase } from "@/lib/types";

interface PersonalResultProps {
  sajuData: SajuAnalysisData;
  teaserText: string;
  fullText: string;
  isStreaming: boolean;
  concern?: string;
  phase: AnalysisPhase;
  canLoadMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}

export function PersonalResult({
  sajuData, teaserText, fullText, isStreaming, concern,
  phase, canLoadMore, isLoadingMore, onLoadMore,
}: PersonalResultProps) {
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
      {/* Day master "명함" card */}
      <div
        className={visibleCount >= 1 ? "animate-slide-up" : "opacity-0"}
        style={{ animationFillMode: "backwards" }}
      >
        <div className="glass-card-elevated !bg-primary/10 !border-primary/30 text-center py-6">
          <p className="text-sm text-text-secondary">당신의 일간</p>
          <p className="text-4xl font-display font-bold text-gradient-gold mt-2">
            {sajuData.fourPillarsHanja.day.stem}({sajuData.fourPillars.day.stem})
          </p>
          <p className="mt-2 text-text-secondary text-sm">
            {sajuData.dayMasterStrength === "strong"
              ? "신강(身强)"
              : sajuData.dayMasterStrength === "weak"
                ? "신약(身弱)"
                : "중화(中和)"}
            {" | 용신: "}
            <span className="text-accent font-medium">{sajuData.yongShin}</span>
          </p>
        </div>
      </div>

      {/* Saju Pillar Table */}
      <SectionCard
        title="사주 원국표"
        isVisible={visibleCount >= 1}
        delay={100}
      >
        <PillarTable
          pillars={sajuData.fourPillars}
          pillarsHanja={sajuData.fourPillarsHanja}
          tenGods={sajuData.tenGods}
          twelveStages={sajuData.twelveStages}
        />
        <div className="mt-4 space-y-2">
          {sajuData.spirits.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {sajuData.spirits.map((s) => (
                <span
                  key={s}
                  className="inline-flex rounded-full bg-primary/15 border border-primary/25 px-3 py-1 text-xs text-primary-glow"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
          <WarningBadge items={sajuData.branchRelations.chung} label="충" />
          <WarningBadge items={sajuData.branchRelations.hyung} label="형" />
          {sajuData.emptiness.length > 0 && (
            <WarningBadge items={sajuData.emptiness.map((e) => `${e} 공망`)} label="공망" />
          )}
        </div>
      </SectionCard>

      {/* Five Elements Chart */}
      <SectionCard
        title="오행 분포"
        isVisible={visibleCount >= 2}
        delay={200}
      >
        <FiveElementsChart
          elements={sajuData.fiveElements}
          dominant={sajuData.dominantElement}
          weakest={sajuData.weakestElement}
        />
      </SectionCard>

      {/* Daeun Timeline */}
      <SectionCard
        title="대운·세운 흐름"
        isVisible={visibleCount >= 3}
        delay={300}
      >
        <DaeunTimeline
          daeunList={sajuData.daeunList}
          currentDaeun={sajuData.currentDaeun}
          currentSeun={sajuData.currentSeun}
          nextSeun={sajuData.nextSeun}
        />
      </SectionCard>

      {/* Streamed AI Analysis — single card, teaser + full */}
      {visibleCount >= 4 && (teaserText || isStreaming) && (
        <Card variant="elevated" className="animate-slide-up" style={{ animationFillMode: "backwards" }}>
          <StreamingText
            content={fullText ? teaserText + "\n\n" + fullText : teaserText}
            isStreaming={phase === "teaser-streaming" || phase === "full-streaming"}
          />

          {/* 더보기 CTA — teaser done, not yet loaded full */}
          {canLoadMore && !isLoadingMore && (
            <div className="relative mt-4">
              {/* Gradient fade overlay */}
              <div className="absolute -top-16 left-0 right-0 h-16 bg-gradient-to-t from-[#1E293B] to-transparent pointer-events-none" />
              <div className="text-center py-6 border-t border-white/[0.08]">
                <p className="text-sm text-text-secondary mb-3">
                  {concern
                    ? "주의 시기 + 월별 전략 + 맞춤 처방이 궁금하다면?"
                    : "6대 운세, 대운 타임라인이 궁금하시다면?"}
                </p>
                <button
                  onClick={onLoadMore}
                  className="relative px-8 py-3 rounded-xl text-base font-medium bg-gradient-to-r from-primary via-primary-light to-primary text-white border border-accent/40 shadow-[0_0_20px_rgba(212,175,55,0.15)] hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:border-accent/70 active:scale-[0.98] transition-all duration-300"
                >
                  전체 분석 잠금해제 · 1,650원
                </button>
                <p className="mt-2 text-xs text-text-secondary/70">
                  카카오페이 · 결제 후 영구 보관 (최대 10건)
                </p>
              </div>
            </div>
          )}

          {/* Loading more indicator */}
          {isLoadingMore && (
            <div className="text-center py-6 border-t border-white/[0.08]">
              <span className="inline-flex items-center gap-2 text-accent animate-pulse">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                상세 분석을 생성하고 있어요...
              </span>
            </div>
          )}

          {/* Footer + Share — only after full analysis done */}
          {isFullDone && (teaserText || fullText) && (
            <>
              <div className="mt-6 pt-4 border-t border-white/[0.08] text-xs text-text-secondary/50 text-center">
                사주는 참고 도구이며, 운명은 노력과 선택에 의해 바뀔 수 있습니다.
              </div>
              <ShareBar
                resultText={teaserText + "\n\n" + fullText}
                shareData={{
                  type: "personal",
                  resultText: teaserText + "\n\n" + fullText,
                  sajuData,
                  concern,
                }}
              />
            </>
          )}
        </Card>
      )}
    </div>
  );
}
