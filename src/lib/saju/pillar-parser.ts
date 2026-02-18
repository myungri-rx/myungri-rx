import {
  STEM_HANGUL_TO_HANJA,
  STEM_HANJA_TO_HANGUL,
  BRANCH_HANGUL_TO_HANJA,
  BRANCH_HANJA_TO_HANGUL,
} from "@/lib/constants/stems-branches";
import type { Pillar, PillarHanja } from "@/lib/types";

/**
 * Split a 2-char pillar string into stem and branch
 * e.g. "갑자" → { stem: "갑", branch: "자" }
 */
export function parsePillar(combined: string): Pillar {
  return { stem: combined[0], branch: combined[1] };
}

/**
 * Split a 2-char hanja pillar string into stem and branch
 * e.g. "甲子" → { stem: "甲", branch: "子" }
 */
export function parsePillarHanja(combined: string): PillarHanja {
  return { stem: combined[0], branch: combined[1] };
}

/**
 * Convert hangul pillar to hanja
 */
export function pillarToHanja(pillar: Pillar): PillarHanja {
  return {
    stem: STEM_HANGUL_TO_HANJA[pillar.stem] || pillar.stem,
    branch: BRANCH_HANGUL_TO_HANJA[pillar.branch] || pillar.branch,
  };
}

/**
 * Convert hanja pillar to hangul
 */
export function pillarToHangul(pillar: PillarHanja): Pillar {
  return {
    stem: STEM_HANJA_TO_HANGUL[pillar.stem] || pillar.stem,
    branch: BRANCH_HANJA_TO_HANGUL[pillar.branch] || pillar.branch,
  };
}
