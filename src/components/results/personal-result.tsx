"use client";

import { PillarTable } from "./pillar-table";
import { FiveElementsChart } from "./five-elements-chart";
import { DaeunTimeline } from "./daeun-timeline";
import { WarningBadge } from "./warning-badge";
import { StreamingText } from "./streaming-text";
import { SectionCard } from "./section-card";
import { Card } from "@/components/ui/card";
import type { SajuAnalysisData } from "@/lib/types";

interface PersonalResultProps {
  sajuData: SajuAnalysisData;
  streamedText: string;
  isStreaming: boolean;
}

export function PersonalResult({ sajuData, streamedText, isStreaming }: PersonalResultProps) {
  return (
    <div className="space-y-6">
      {/* Saju Pillar Table - renders immediately */}
      <SectionCard title="사주 원국표">
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
                  className="inline-flex rounded-full bg-primary/20 border border-primary/30 px-3 py-1 text-xs text-primary"
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

        {/* Day master summary */}
        <div className="mt-4 p-3 rounded-lg bg-background/50 text-sm">
          <span className="text-text-secondary">일간: </span>
          <span className="text-accent font-bold">
            {sajuData.fourPillarsHanja.day.stem}({sajuData.fourPillars.day.stem})
          </span>
          <span className="text-text-secondary"> | 신강/신약: </span>
          <span className="text-text-primary font-medium">
            {sajuData.dayMasterStrength === "strong" ? "신강(身强)" : sajuData.dayMasterStrength === "weak" ? "신약(身弱)" : "중화(中和)"}
          </span>
          <span className="text-text-secondary"> | 용신: </span>
          <span className="text-accent">{sajuData.yongShin}</span>
        </div>
      </SectionCard>

      {/* Five Elements Chart - renders immediately */}
      <SectionCard title="오행 분포">
        <FiveElementsChart
          elements={sajuData.fiveElements}
          dominant={sajuData.dominantElement}
          weakest={sajuData.weakestElement}
        />
      </SectionCard>

      {/* Daeun Timeline - renders immediately */}
      <SectionCard title="대운·세운 흐름">
        <DaeunTimeline
          daeunList={sajuData.daeunList}
          currentDaeun={sajuData.currentDaeun}
          currentSeun={sajuData.currentSeun}
          nextSeun={sajuData.nextSeun}
        />
      </SectionCard>

      {/* Streamed AI Analysis */}
      {(streamedText || isStreaming) && (
        <Card>
          <StreamingText content={streamedText} />
          {!isStreaming && streamedText && (
            <div className="mt-6 pt-4 border-t border-text-secondary/10 text-xs text-text-secondary/60 text-center">
              사주는 참고 도구이며, 운명은 노력과 선택에 의해 바뀔 수 있습니다.
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
