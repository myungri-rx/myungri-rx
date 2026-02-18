"use client";

import { useEffect } from "react";
import { PillarTable } from "./pillar-table";
import { FiveElementsChart } from "./five-elements-chart";
import { DaeunTimeline } from "./daeun-timeline";
import { WarningBadge } from "./warning-badge";
import { StreamingText } from "./streaming-text";
import { SectionCard } from "./section-card";
import { Card } from "@/components/ui/card";
import { useRevealSequence } from "@/hooks/use-reveal-sequence";
import type { SajuAnalysisData } from "@/lib/types";

interface PersonalResultProps {
  sajuData: SajuAnalysisData;
  streamedText: string;
  isStreaming: boolean;
}

export function PersonalResult({ sajuData, streamedText, isStreaming }: PersonalResultProps) {
  const { visibleCount, startReveal } = useRevealSequence({
    totalSections: 4,
    intervalMs: 500,
  });

  useEffect(() => {
    startReveal();
  }, [startReveal]);

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

        {/* Spirits & warnings */}
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

      {/* Streamed AI Analysis */}
      {visibleCount >= 4 && (streamedText || isStreaming) && (
        <Card variant="elevated" className="animate-slide-up" style={{ animationFillMode: "backwards" }}>
          <StreamingText content={streamedText} />
          {!isStreaming && streamedText && (
            <div className="mt-6 pt-4 border-t border-white/[0.08] text-xs text-text-secondary/50 text-center">
              사주는 참고 도구이며, 운명은 노력과 선택에 의해 바뀔 수 있습니다.
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
