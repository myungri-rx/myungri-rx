"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { STEM_TO_OHAENG, BRANCH_TO_OHAENG } from "@/lib/constants/stems-branches";
import type { FourPillars, FourPillarsHanja, TenGods, TwelveStages } from "@/lib/types";

const OHAENG_COLOR: Record<string, string> = {
  목: "text-ohaeng-wood",
  화: "text-ohaeng-fire",
  토: "text-ohaeng-earth",
  금: "text-ohaeng-metal",
  수: "text-ohaeng-water",
};

const OHAENG_BG: Record<string, string> = {
  목: "bg-ohaeng-wood/10",
  화: "bg-ohaeng-fire/10",
  토: "bg-ohaeng-earth/10",
  금: "bg-ohaeng-metal/10",
  수: "bg-ohaeng-water/10",
};

const OHAENG_GLOW: Record<string, string> = {
  목: "ohaeng-glow-wood",
  화: "ohaeng-glow-fire",
  토: "ohaeng-glow-earth",
  금: "ohaeng-glow-metal",
  수: "ohaeng-glow-water",
};

const PILLAR_LABELS = ["시주", "일주", "월주", "년주"];
const PALACE_LABELS = ["자녀궁", "본인궁", "부모궁", "조상궁"];

interface PillarTableProps {
  pillars: FourPillars;
  pillarsHanja: FourPillarsHanja;
  tenGods: TenGods;
  twelveStages: TwelveStages;
}

export function PillarTable({ pillars, pillarsHanja, tenGods, twelveStages }: PillarTableProps) {
  const [revealedColumns, setRevealedColumns] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setRevealedColumns((prev) => {
        if (prev >= 4) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 400);
    return () => clearInterval(timer);
  }, []);

  const columns = [
    {
      pillar: pillars.hour,
      hanja: pillarsHanja.hour,
      stemGod: tenGods.hourStem,
      branchGod: tenGods.hourBranch,
      stage: twelveStages.hour,
    },
    {
      pillar: pillars.day,
      hanja: pillarsHanja.day,
      stemGod: "일간",
      branchGod: tenGods.dayBranch,
      stage: twelveStages.day,
    },
    {
      pillar: pillars.month,
      hanja: pillarsHanja.month,
      stemGod: tenGods.monthStem,
      branchGod: tenGods.monthBranch,
      stage: twelveStages.month,
    },
    {
      pillar: pillars.year,
      hanja: pillarsHanja.year,
      stemGod: tenGods.yearStem,
      branchGod: tenGods.yearBranch,
      stage: twelveStages.year,
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-3 md:gap-4">
      {columns.map((col, i) => {
        const isRevealed = i < revealedColumns;
        const stemOhaeng = col.pillar ? STEM_TO_OHAENG[col.pillar.stem] : null;
        const branchOhaeng = col.pillar ? BRANCH_TO_OHAENG[col.pillar.branch] : null;

        return (
          <div
            key={i}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-500",
              isRevealed ? "animate-card-flip" : "opacity-0",
            )}
            style={{
              animationDelay: `${i * 400}ms`,
              animationFillMode: "backwards",
            }}
          >
            {/* Label */}
            <div className="text-xs text-text-secondary font-medium">
              {PILLAR_LABELS[i]}
            </div>
            <div className="text-[10px] text-text-secondary/60">
              {PALACE_LABELS[i]}
            </div>

            {/* 십신 (stem) */}
            <div className="text-xs text-text-secondary mt-1">
              {col.stemGod || "—"}
            </div>

            {/* 천간 cell */}
            {!col.pillar ? (
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-text-secondary/30 text-2xl">
                ?
              </div>
            ) : (
              <div
                className={cn(
                  "w-16 h-16 md:w-20 md:h-20 rounded-xl flex flex-col items-center justify-center",
                  stemOhaeng && OHAENG_BG[stemOhaeng],
                  stemOhaeng && OHAENG_GLOW[stemOhaeng],
                )}
              >
                <span
                  className={cn(
                    "text-2xl md:text-3xl font-bold font-display",
                    stemOhaeng && OHAENG_COLOR[stemOhaeng],
                  )}
                >
                  {col.hanja?.stem}
                </span>
                <span className="text-[10px] text-text-secondary">
                  {col.pillar.stem}
                </span>
              </div>
            )}

            {/* 지지 cell */}
            {!col.pillar ? (
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-text-secondary/30 text-2xl">
                ?
              </div>
            ) : (
              <div
                className={cn(
                  "w-16 h-16 md:w-20 md:h-20 rounded-xl flex flex-col items-center justify-center",
                  branchOhaeng && OHAENG_BG[branchOhaeng],
                  branchOhaeng && OHAENG_GLOW[branchOhaeng],
                )}
              >
                <span
                  className={cn(
                    "text-2xl md:text-3xl font-bold font-display",
                    branchOhaeng && OHAENG_COLOR[branchOhaeng],
                  )}
                >
                  {col.hanja?.branch}
                </span>
                <span className="text-[10px] text-text-secondary">
                  {col.pillar.branch}
                </span>
              </div>
            )}

            {/* 십신 (branch) */}
            <div className="text-xs text-text-secondary">
              {col.branchGod || "—"}
            </div>

            {/* 12운성 */}
            <div className="text-[10px] text-accent/70">
              {col.stage || "—"}
            </div>
          </div>
        );
      })}
    </div>
  );
}
