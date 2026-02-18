"use client";

import type { FiveElements } from "@/lib/types";

const ELEMENTS = [
  { key: "wood" as const, label: "목(木)", color: "#22C55E" },
  { key: "fire" as const, label: "화(火)", color: "#EF4444" },
  { key: "earth" as const, label: "토(土)", color: "#EAB308" },
  { key: "metal" as const, label: "금(金)", color: "#F8FAFC" },
  { key: "water" as const, label: "수(水)", color: "#3B82F6" },
];

interface FiveElementsChartProps {
  elements: FiveElements;
  dominant: string;
  weakest: string;
}

export function FiveElementsChart({ elements, dominant, weakest }: FiveElementsChartProps) {
  const maxValue = Math.max(...Object.values(elements), 1);

  return (
    <div className="space-y-3">
      {ELEMENTS.map(({ key, label, color }) => {
        const value = elements[key];
        const pct = (value / maxValue) * 100;
        return (
          <div key={key} className="flex items-center gap-3">
            <span className="w-16 text-sm text-text-secondary text-right">{label}</span>
            <div className="flex-1 h-5 bg-surface/50 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
            <span className="w-8 text-sm text-text-secondary">{value}</span>
          </div>
        );
      })}
      <div className="flex gap-4 text-xs text-text-secondary mt-2">
        <span>
          가장 강한 오행: <span className="text-accent font-medium">{dominant}</span>
        </span>
        <span>
          가장 약한 오행: <span className="text-ohaeng-fire font-medium">{weakest}</span>
        </span>
      </div>
    </div>
  );
}
