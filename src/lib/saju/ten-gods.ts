import { STEMS_HANGUL } from "@/lib/constants/stems-branches";
import { TEN_GODS_TABLE } from "@/lib/constants/ten-gods";
import { HIDDEN_STEMS_TABLE } from "@/lib/constants/hidden-stems";
import type { FourPillars, TenGods } from "@/lib/types";

/**
 * Get the ten god (십신) relationship between day stem and another stem.
 */
export function getTenGod(dayStem: string, otherStem: string): string {
  const row = TEN_GODS_TABLE[dayStem];
  if (!row) return "";
  const idx = STEMS_HANGUL.indexOf(otherStem as (typeof STEMS_HANGUL)[number]);
  if (idx === -1) return "";
  return row[idx];
}

/**
 * Get ten god for a branch by looking up its main hidden stem (본기).
 */
export function getTenGodForBranch(dayStem: string, branch: string): string {
  const hiddenStems = HIDDEN_STEMS_TABLE[branch];
  if (!hiddenStems || hiddenStems.length === 0) return "";
  return getTenGod(dayStem, hiddenStems[0]); // use 본기 (main qi)
}

/**
 * Compute all ten gods for four pillars (일간 기준).
 */
export function computeTenGods(pillars: FourPillars): TenGods {
  const dayStem = pillars.day.stem;

  return {
    yearStem: getTenGod(dayStem, pillars.year.stem),
    yearBranch: getTenGodForBranch(dayStem, pillars.year.branch),
    monthStem: getTenGod(dayStem, pillars.month.stem),
    monthBranch: getTenGodForBranch(dayStem, pillars.month.branch),
    dayStem: "비견", // day stem is always 비견 to itself
    dayBranch: getTenGodForBranch(dayStem, pillars.day.branch),
    hourStem: pillars.hour ? getTenGod(dayStem, pillars.hour.stem) : undefined,
    hourBranch: pillars.hour ? getTenGodForBranch(dayStem, pillars.hour.branch) : undefined,
  };
}
