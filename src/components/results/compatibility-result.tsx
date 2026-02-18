"use client";

import { PillarTable } from "./pillar-table";
import { CompatibilityRadar } from "./compatibility-radar";
import { StreamingText } from "./streaming-text";
import { SectionCard } from "./section-card";
import { Card } from "@/components/ui/card";
import type { SajuAnalysisData } from "@/lib/types";
import { parseCompatibilityScores } from "@/lib/utils/parse-sections";

interface CompatibilityResultProps {
  person1: SajuAnalysisData;
  person2: SajuAnalysisData;
  streamedText: string;
  isStreaming: boolean;
}

export function CompatibilityResult({
  person1,
  person2,
  streamedText,
  isStreaming,
}: CompatibilityResultProps) {
  const scores = parseCompatibilityScores(streamedText);

  return (
    <div className="space-y-6">
      {/* Both pillar tables side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard title={`${person1.input.name}의 사주`}>
          <PillarTable
            pillars={person1.fourPillars}
            pillarsHanja={person1.fourPillarsHanja}
            tenGods={person1.tenGods}
            twelveStages={person1.twelveStages}
          />
        </SectionCard>
        <SectionCard title={`${person2.input.name}의 사주`}>
          <PillarTable
            pillars={person2.fourPillars}
            pillarsHanja={person2.fourPillarsHanja}
            tenGods={person2.tenGods}
            twelveStages={person2.twelveStages}
          />
        </SectionCard>
      </div>

      {/* Radar chart appears once scores are parsed from AI response */}
      {scores && (
        <SectionCard title="궁합 레이더">
          <CompatibilityRadar
            data={scores.dimensions}
            totalScore={scores.total}
          />
        </SectionCard>
      )}

      {/* Streamed AI Analysis */}
      {(streamedText || isStreaming) && (
        <Card>
          <StreamingText content={streamedText} />
          {!isStreaming && streamedText && (
            <div className="mt-6 pt-4 border-t border-text-secondary/10 text-xs text-text-secondary/60 text-center">
              궁합 점수는 절대적 판단이 아닌 관계 개선의 가이드입니다.
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
