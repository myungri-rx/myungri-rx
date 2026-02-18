import { HIDDEN_STEMS_TABLE } from "@/lib/constants/hidden-stems";
import type { FourPillars, HiddenStems } from "@/lib/types";

/**
 * Get hidden stems for a branch.
 */
export function getHiddenStems(branch: string): string[] {
  return HIDDEN_STEMS_TABLE[branch] || [];
}

/**
 * Compute hidden stems for all four pillar branches.
 */
export function computeHiddenStems(pillars: FourPillars): HiddenStems {
  return {
    year: getHiddenStems(pillars.year.branch),
    month: getHiddenStems(pillars.month.branch),
    day: getHiddenStems(pillars.day.branch),
    hour: pillars.hour ? getHiddenStems(pillars.hour.branch) : undefined,
  };
}
