
import { useState, useEffect } from "react";
import type { FiveElements } from "@/lib/types";

const ELEMENTS = [
  { key: "wood" as const, label: "木", subLabel: "목", color: "#22C55E" },
  { key: "fire" as const, label: "火", subLabel: "화", color: "#EF4444" },
  { key: "earth" as const, label: "土", subLabel: "토", color: "#EAB308" },
  { key: "metal" as const, label: "金", subLabel: "금", color: "#F8FAFC" },
  { key: "water" as const, label: "水", subLabel: "수", color: "#3B82F6" },
];

interface FiveElementsChartProps {
  elements: FiveElements;
  dominant: string;
  weakest: string;
}

export function FiveElementsChart({ elements, dominant, weakest }: FiveElementsChartProps) {
  const maxValue = Math.max(...Object.values(elements), 1);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-4">
      {ELEMENTS.map(({ key, label, subLabel, color }, index) => {
        const value = elements[key];
        const pct = (value / maxValue) * 100;
        return (
          <div key={key} className="flex items-center gap-3">
            <span
              className="w-10 text-center font-display text-lg font-bold"
              style={{ color }}
            >
              {label}
            </span>
            <span className="w-6 text-xs text-text-secondary">{subLabel}</span>
            <div className="flex-1 h-6 md:h-8 bg-white/[0.03] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all ease-out"
                style={{
                  width: animate ? `${pct}%` : "0%",
                  backgroundColor: color,
                  boxShadow: `0 0 12px ${color}40`,
                  transitionDuration: `${800 + index * 200}ms`,
                  transitionDelay: `${index * 100}ms`,
                }}
              />
            </div>
            <span className="w-8 text-sm text-text-secondary text-right">{value}</span>
          </div>
        );
      })}
      <div className="flex gap-3 mt-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 border border-accent/25 px-3 py-1 text-xs text-accent">
          가장 강한 오행: {dominant}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 border border-red-500/25 px-3 py-1 text-xs text-red-400">
          가장 약한 오행: {weakest}
        </span>
      </div>
    </div>
  );
}
