import {
  STEM_TO_OHAENG,
  BRANCH_TO_OHAENG,
  OHAENG_NAME_TO_KEY,
  OHAENG_KEY_TO_NAME,
} from "@/lib/constants/stems-branches";
import { HIDDEN_STEMS_TABLE } from "@/lib/constants/hidden-stems";
import type { FourPillars, FiveElements, OhaengKey } from "@/lib/types";

/**
 * Count five elements distribution across all stems and branches (including hidden stems).
 */
export function computeFiveElements(pillars: FourPillars): FiveElements {
  const counts: FiveElements = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };

  const positions = [pillars.year, pillars.month, pillars.day];
  if (pillars.hour) positions.push(pillars.hour);

  for (const pos of positions) {
    // Count stem ohaeng
    const stemOhaeng = STEM_TO_OHAENG[pos.stem];
    if (stemOhaeng) {
      counts[OHAENG_NAME_TO_KEY[stemOhaeng]] += 1;
    }

    // Count branch's hidden stems' ohaeng (weighted: 본기=1, 중기=0.5, 여기=0.3)
    const hiddenStems = HIDDEN_STEMS_TABLE[pos.branch];
    if (hiddenStems) {
      const weights = [1, 0.5, 0.3];
      hiddenStems.forEach((stem, idx) => {
        const oh = STEM_TO_OHAENG[stem];
        if (oh) {
          counts[OHAENG_NAME_TO_KEY[oh]] += weights[idx] || 0.3;
        }
      });
    }
  }

  // Round to 1 decimal
  for (const key of Object.keys(counts) as OhaengKey[]) {
    counts[key] = Math.round(counts[key] * 10) / 10;
  }

  return counts;
}

/**
 * Find the dominant (strongest) element.
 */
export function getDominantElement(elements: FiveElements): string {
  const keys = Object.keys(elements) as OhaengKey[];
  let max: OhaengKey = "wood";
  for (const k of keys) {
    if (elements[k] > elements[max]) max = k;
  }
  return OHAENG_KEY_TO_NAME[max];
}

/**
 * Find the weakest element.
 */
export function getWeakestElement(elements: FiveElements): string {
  const keys = Object.keys(elements) as OhaengKey[];
  let min: OhaengKey = "wood";
  for (const k of keys) {
    if (elements[k] < elements[min]) min = k;
  }
  return OHAENG_KEY_TO_NAME[min];
}
