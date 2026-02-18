import { BRANCHES_HANGUL } from "@/lib/constants/stems-branches";
import { TWELVE_STAGES_TABLE } from "@/lib/constants/twelve-stages";
import type { FourPillars, TwelveStages } from "@/lib/types";

/**
 * Get the 12운성 for a given day stem and branch.
 */
export function getTwelveStage(dayStem: string, branch: string): string {
  const row = TWELVE_STAGES_TABLE[dayStem];
  if (!row) return "";
  const idx = BRANCHES_HANGUL.indexOf(branch as (typeof BRANCHES_HANGUL)[number]);
  if (idx === -1) return "";
  return row[idx];
}

/**
 * Compute 12운성 for all four pillar branches (일간 기준).
 */
export function computeTwelveStages(pillars: FourPillars): TwelveStages {
  const dayStem = pillars.day.stem;
  return {
    year: getTwelveStage(dayStem, pillars.year.branch),
    month: getTwelveStage(dayStem, pillars.month.branch),
    day: getTwelveStage(dayStem, pillars.day.branch),
    hour: pillars.hour ? getTwelveStage(dayStem, pillars.hour.branch) : undefined,
  };
}
