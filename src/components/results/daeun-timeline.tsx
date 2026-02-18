"use client";

import { cn } from "@/lib/utils";
import type { DaeunInfo, SeunInfo } from "@/lib/types";

interface DaeunTimelineProps {
  daeunList: DaeunInfo[];
  currentDaeun: DaeunInfo;
  currentSeun: SeunInfo;
  nextSeun: SeunInfo;
}

export function DaeunTimeline({ daeunList, currentDaeun, currentSeun, nextSeun }: DaeunTimelineProps) {
  return (
    <div className="space-y-4">
      {/* 대운 Timeline */}
      <div>
        <h4 className="text-sm font-medium text-text-secondary mb-3">대운 흐름</h4>
        <div className="flex gap-1 overflow-x-auto pb-2">
          {daeunList.map((daeun, i) => {
            const isCurrent =
              daeun.startAge === currentDaeun.startAge;
            return (
              <div
                key={i}
                className={cn(
                  "flex-shrink-0 w-20 rounded-lg p-2 text-center transition-colors",
                  isCurrent
                    ? "bg-primary/30 border border-primary"
                    : "bg-surface/50 border border-text-secondary/10",
                )}
              >
                <div className="text-lg font-bold text-text-primary">
                  {daeun.stemHanja}{daeun.branchHanja}
                </div>
                <div className="text-[10px] text-text-secondary">
                  {daeun.stem}{daeun.branch}
                </div>
                <div className="text-xs text-accent mt-1">{daeun.tenGod}</div>
                <div className="text-[10px] text-text-secondary mt-0.5">
                  {daeun.startAge}~{daeun.endAge}세
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 세운 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-primary/20 border border-primary/30 p-3 text-center">
          <div className="text-xs text-text-secondary mb-1">올해 세운 ({currentSeun.year})</div>
          <div className="text-xl font-bold text-text-primary">
            {currentSeun.stemHanja}{currentSeun.branchHanja}
          </div>
          <div className="text-xs text-text-secondary">{currentSeun.stem}{currentSeun.branch}</div>
          <div className="text-sm text-accent mt-1">{currentSeun.tenGod}</div>
        </div>
        <div className="rounded-lg bg-surface/50 border border-text-secondary/10 p-3 text-center">
          <div className="text-xs text-text-secondary mb-1">내년 세운 ({nextSeun.year})</div>
          <div className="text-xl font-bold text-text-primary">
            {nextSeun.stemHanja}{nextSeun.branchHanja}
          </div>
          <div className="text-xs text-text-secondary">{nextSeun.stem}{nextSeun.branch}</div>
          <div className="text-sm text-accent mt-1">{nextSeun.tenGod}</div>
        </div>
      </div>
    </div>
  );
}
