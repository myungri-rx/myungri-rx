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
    <div className="space-y-6">
      {/* 대운 Timeline */}
      <div>
        <h4 className="text-sm font-medium text-text-secondary font-display mb-3">대운 흐름</h4>
        <div className="relative flex gap-2 overflow-x-auto pb-3">
          {/* Connecting gold line */}
          <div
            className="absolute top-1/2 left-0 right-0 h-px z-0"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.2) 10%, rgba(212,175,55,0.2) 90%, transparent 100%)",
            }}
          />
          {daeunList.map((daeun, i) => {
            const isCurrent = daeun.startAge === currentDaeun.startAge;
            return (
              <div
                key={i}
                className={cn(
                  "relative z-10 flex-shrink-0 w-24 rounded-xl p-3 text-center transition-all duration-300",
                  isCurrent
                    ? "glass-card-elevated border-primary/50 shadow-[0_0_15px_rgba(212,175,55,0.2)] animate-pulse-glow"
                    : "glass-card",
                )}
              >
                <div className="text-xl md:text-2xl font-bold font-display text-text-primary">
                  {daeun.stemHanja}{daeun.branchHanja}
                </div>
                <div className="text-[10px] text-text-secondary mt-0.5">
                  {daeun.stem}{daeun.branch}
                </div>
                <div className="text-xs text-accent mt-1 font-medium">{daeun.tenGod}</div>
                <div className="text-[10px] text-text-secondary mt-0.5">
                  {daeun.startAge}~{daeun.endAge}세
                </div>
                {isCurrent && (
                  <div className="mt-1 text-[9px] text-accent font-bold">현재</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 세운 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card-elevated !border-primary/30 p-4 text-center">
          <div className="text-xs text-accent mb-1 font-medium">올해 세운 ({currentSeun.year})</div>
          <div className="text-2xl md:text-3xl font-bold font-display text-text-primary mt-1">
            {currentSeun.stemHanja}{currentSeun.branchHanja}
          </div>
          <div className="text-xs text-text-secondary mt-1">{currentSeun.stem}{currentSeun.branch}</div>
          <div className="text-sm text-accent mt-1 font-medium">{currentSeun.tenGod}</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-xs text-text-secondary mb-1">내년 세운 ({nextSeun.year})</div>
          <div className="text-2xl md:text-3xl font-bold font-display text-text-primary mt-1">
            {nextSeun.stemHanja}{nextSeun.branchHanja}
          </div>
          <div className="text-xs text-text-secondary mt-1">{nextSeun.stem}{nextSeun.branch}</div>
          <div className="text-sm text-accent mt-1 font-medium">{nextSeun.tenGod}</div>
        </div>
      </div>
    </div>
  );
}
