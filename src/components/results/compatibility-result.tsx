"use client";

import { useEffect } from "react";
import { PillarTable } from "./pillar-table";
import { CompatibilityRadar } from "./compatibility-radar";
import { StreamingText } from "./streaming-text";
import { SectionCard } from "./section-card";
import { ShareBar } from "./share-bar";
import { Card } from "@/components/ui/card";
import { useRevealSequence } from "@/hooks/use-reveal-sequence";
import type { SajuAnalysisData } from "@/lib/types";
import { parseCompatibilityScores } from "@/lib/utils/parse-sections";

interface CompatibilityResultProps {
  person1: SajuAnalysisData;
  person2: SajuAnalysisData;
  streamedText: string;
  isStreaming: boolean;
  relationshipType?: string;
}

export function CompatibilityResult({
  person1,
  person2,
  streamedText,
  isStreaming,
  relationshipType,
}: CompatibilityResultProps) {
  const scores = parseCompatibilityScores(streamedText);

  const { visibleCount, startReveal } = useRevealSequence({
    totalSections: 4,
    intervalMs: 500,
  });

  useEffect(() => {
    startReveal();
  }, [startReveal]);

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

          {/* VS divider */}
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

      {/* Streamed AI Analysis */}
      {visibleCount >= 3 && (streamedText || isStreaming) && (
        <Card
          variant="elevated"
          className="animate-slide-up"
          style={{ animationDelay: "400ms", animationFillMode: "backwards" }}
        >
          <StreamingText content={streamedText} />
          {!isStreaming && streamedText && (
            <>
              <div className="mt-6 pt-4 border-t border-white/[0.08] text-xs text-text-secondary/50 text-center">
                궁합 점수는 절대적 판단이 아닌 관계 개선의 가이드입니다.
              </div>
              <ShareBar
                resultText={streamedText}
                shareData={{
                  type: "compatibility",
                  resultText: streamedText,
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
