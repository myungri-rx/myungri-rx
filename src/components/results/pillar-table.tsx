"use client";

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

const PILLAR_LABELS = ["시주", "일주", "월주", "년주"];
const PALACE_LABELS = ["자녀궁", "본인궁", "부모궁", "조상궁"];

interface PillarTableProps {
  pillars: FourPillars;
  pillarsHanja: FourPillarsHanja;
  tenGods: TenGods;
  twelveStages: TwelveStages;
}

export function PillarTable({ pillars, pillarsHanja, tenGods, twelveStages }: PillarTableProps) {
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
    <div className="overflow-x-auto">
      <table className="w-full text-center">
        <thead>
          <tr>
            {PILLAR_LABELS.map((label, i) => (
              <th key={label} className="pb-1 text-xs text-text-secondary font-normal">
                {label}
                <div className="text-[10px] text-text-secondary/60">{PALACE_LABELS[i]}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* 십신 row */}
          <tr>
            {columns.map((col, i) => (
              <td key={`god-${i}`} className="py-1 text-xs text-text-secondary">
                {col.stemGod || "—"}
              </td>
            ))}
          </tr>
          {/* 천간 row */}
          <tr>
            {columns.map((col, i) => {
              if (!col.pillar) {
                return (
                  <td key={`stem-${i}`} className="py-2">
                    <div className="mx-auto w-12 h-12 rounded-lg bg-surface/50 flex items-center justify-center text-text-secondary/30 text-lg">
                      ?
                    </div>
                  </td>
                );
              }
              const ohaeng = STEM_TO_OHAENG[col.pillar.stem];
              return (
                <td key={`stem-${i}`} className="py-2">
                  <div
                    className={cn(
                      "mx-auto w-12 h-12 rounded-lg flex flex-col items-center justify-center",
                      ohaeng && OHAENG_BG[ohaeng],
                    )}
                  >
                    <span className={cn("text-xl font-bold", ohaeng && OHAENG_COLOR[ohaeng])}>
                      {col.hanja?.stem}
                    </span>
                    <span className="text-[10px] text-text-secondary">{col.pillar.stem}</span>
                  </div>
                </td>
              );
            })}
          </tr>
          {/* 지지 row */}
          <tr>
            {columns.map((col, i) => {
              if (!col.pillar) {
                return (
                  <td key={`branch-${i}`} className="py-2">
                    <div className="mx-auto w-12 h-12 rounded-lg bg-surface/50 flex items-center justify-center text-text-secondary/30 text-lg">
                      ?
                    </div>
                  </td>
                );
              }
              const ohaeng = BRANCH_TO_OHAENG[col.pillar.branch];
              return (
                <td key={`branch-${i}`} className="py-2">
                  <div
                    className={cn(
                      "mx-auto w-12 h-12 rounded-lg flex flex-col items-center justify-center",
                      ohaeng && OHAENG_BG[ohaeng],
                    )}
                  >
                    <span className={cn("text-xl font-bold", ohaeng && OHAENG_COLOR[ohaeng])}>
                      {col.hanja?.branch}
                    </span>
                    <span className="text-[10px] text-text-secondary">{col.pillar.branch}</span>
                  </div>
                </td>
              );
            })}
          </tr>
          {/* 십신 (branch) row */}
          <tr>
            {columns.map((col, i) => (
              <td key={`bgod-${i}`} className="py-1 text-xs text-text-secondary">
                {col.branchGod || "—"}
              </td>
            ))}
          </tr>
          {/* 12운성 row */}
          <tr>
            {columns.map((col, i) => (
              <td key={`stage-${i}`} className="py-1 text-[10px] text-accent/70">
                {col.stage || "—"}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
