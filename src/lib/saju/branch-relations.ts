import {
  SAMHAP_GROUPS,
  YUKHAP_PAIRS,
  BANGHAP_GROUPS,
  CHUNG_PAIRS,
  HYUNG_GROUPS,
  JAHYUNG_BRANCHES,
  HAE_PAIRS,
  WONJIN_PAIRS,
} from "@/lib/constants/branch-relations";
import type { FourPillars, BranchRelations } from "@/lib/types";

function getBranches(pillars: FourPillars): string[] {
  const branches = [pillars.year.branch, pillars.month.branch, pillars.day.branch];
  if (pillars.hour) branches.push(pillars.hour.branch);
  return branches;
}

/**
 * Detect 삼합 (Three Harmonies) among pillar branches.
 */
function detectSamhap(branches: string[]): string[] {
  const results: string[] = [];
  for (const group of SAMHAP_GROUPS) {
    const matching = group.branches.filter((b) => branches.includes(b));
    if (matching.length >= 2) {
      results.push(`${matching.join("")} ${group.element}국`);
    }
  }
  return results;
}

/**
 * Detect 육합 (Six Harmonies) among pillar branches.
 */
function detectYukhap(branches: string[]): string[] {
  const results: string[] = [];
  for (const [a, b] of YUKHAP_PAIRS) {
    if (branches.includes(a) && branches.includes(b)) {
      results.push(`${a}${b}합`);
    }
  }
  return results;
}

/**
 * Detect 방합 (Directional Harmony) among pillar branches.
 */
function detectBanghap(branches: string[]): string[] {
  const results: string[] = [];
  for (const group of BANGHAP_GROUPS) {
    const matching = group.branches.filter((b) => branches.includes(b));
    if (matching.length >= 3) {
      results.push(`${group.direction}방합 ${group.element}국`);
    }
  }
  return results;
}

/**
 * Detect 충 (Clash) among pillar branches.
 */
function detectChung(branches: string[]): string[] {
  const results: string[] = [];
  for (const [a, b] of CHUNG_PAIRS) {
    if (branches.includes(a) && branches.includes(b)) {
      results.push(`${a}${b}충`);
    }
  }
  return results;
}

/**
 * Detect 형 (Punishment) among pillar branches.
 */
function detectHyung(branches: string[]): string[] {
  const results: string[] = [];
  for (const group of HYUNG_GROUPS) {
    const matching = group.branches.filter((b) => branches.includes(b));
    if (matching.length >= 2) {
      results.push(`${matching.join("")}형(${group.name})`);
    }
  }
  // 자형 (self-punishment)
  for (const b of JAHYUNG_BRANCHES) {
    const count = branches.filter((br) => br === b).length;
    if (count >= 2) {
      results.push(`${b}${b}자형`);
    }
  }
  return results;
}

/**
 * Detect 해 (Harm) among pillar branches.
 */
function detectHae(branches: string[]): string[] {
  const results: string[] = [];
  for (const [a, b] of HAE_PAIRS) {
    if (branches.includes(a) && branches.includes(b)) {
      results.push(`${a}${b}해`);
    }
  }
  return results;
}

/**
 * Compute all branch relations for four pillars.
 */
export function computeBranchRelations(pillars: FourPillars): BranchRelations {
  const branches = getBranches(pillars);
  return {
    samhap: detectSamhap(branches),
    yukhap: detectYukhap(branches),
    chung: detectChung(branches),
    hyung: detectHyung(branches),
    hae: detectHae(branches),
    banghap: detectBanghap(branches),
  };
}
