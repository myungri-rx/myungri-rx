import {
  DOHWA_TABLE,
  YEOKMA_TABLE,
  HWAGAE_TABLE,
  CHEONEUL_TABLE,
  YANGIN_TABLE,
  HONGYEOM_TABLE,
  CHEONHEE_TABLE,
  CHEONDUK_TABLE,
  WOLDUK_TABLE,
  getGongmangBranches,
} from "@/lib/constants/spirits";
import type { FourPillars } from "@/lib/types";

function getBranches(pillars: FourPillars): string[] {
  const b = [pillars.year.branch, pillars.month.branch, pillars.day.branch];
  if (pillars.hour) b.push(pillars.hour.branch);
  return b;
}

function getStems(pillars: FourPillars): string[] {
  const s = [pillars.year.stem, pillars.month.stem, pillars.day.stem];
  if (pillars.hour) s.push(pillars.hour.stem);
  return s;
}

/**
 * Detect all 신살 (spirits/stars) in the four pillars.
 */
export function detectSpirits(pillars: FourPillars): string[] {
  const spirits: string[] = [];
  const branches = getBranches(pillars);
  const stems = getStems(pillars);
  const dayStem = pillars.day.stem;
  const dayBranch = pillars.day.branch;
  const yearBranch = pillars.year.branch;
  const monthBranch = pillars.month.branch;

  // 도화살 - based on day branch
  const dohwaTarget = DOHWA_TABLE[dayBranch];
  if (dohwaTarget && branches.includes(dohwaTarget)) {
    spirits.push("도화살");
  }

  // 역마살 - based on day branch
  const yeokmaTarget = YEOKMA_TABLE[dayBranch];
  if (yeokmaTarget && branches.includes(yeokmaTarget)) {
    spirits.push("역마살");
  }

  // 화개살 - based on day branch
  const hwagaeTarget = HWAGAE_TABLE[dayBranch];
  if (hwagaeTarget && branches.includes(hwagaeTarget)) {
    spirits.push("화개살");
  }

  // 천을귀인 - based on day stem
  const cheoneulTargets = CHEONEUL_TABLE[dayStem];
  if (cheoneulTargets) {
    for (const target of cheoneulTargets) {
      if (branches.includes(target)) {
        spirits.push("천을귀인");
        break;
      }
    }
  }

  // 양인 - based on day stem
  const yanginTarget = YANGIN_TABLE[dayStem];
  if (yanginTarget && branches.includes(yanginTarget)) {
    spirits.push("양인");
  }

  // 홍염살 - based on day stem
  const hongyeomTarget = HONGYEOM_TABLE[dayStem];
  if (hongyeomTarget && branches.includes(hongyeomTarget)) {
    spirits.push("홍염살");
  }

  // 천희성 - based on year branch
  const cheonheeTarget = CHEONHEE_TABLE[yearBranch];
  if (cheonheeTarget && branches.includes(cheonheeTarget)) {
    spirits.push("천희성");
  }

  // 천덕귀인 - based on month branch
  const cheondukTarget = CHEONDUK_TABLE[monthBranch];
  if (cheondukTarget && (stems.includes(cheondukTarget) || branches.includes(cheondukTarget))) {
    spirits.push("천덕귀인");
  }

  // 월덕귀인 - based on month branch
  const woldukTarget = WOLDUK_TABLE[monthBranch];
  if (woldukTarget && stems.includes(woldukTarget)) {
    spirits.push("월덕귀인");
  }

  return spirits;
}

/**
 * Detect 공망 (emptiness) for the four pillars.
 */
export function detectEmptiness(pillars: FourPillars): string[] {
  const gongmangBranches = getGongmangBranches(pillars.day.stem, pillars.day.branch);
  const branches = getBranches(pillars);

  return gongmangBranches.filter((b) => branches.includes(b));
}
