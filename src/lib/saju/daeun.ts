import {
  STEMS_HANGUL,
  BRANCHES_HANGUL,
  STEM_HANGUL_TO_HANJA,
  BRANCH_HANGUL_TO_HANJA,
  STEM_YINYANG,
} from "@/lib/constants/stems-branches";
import { getTenGod } from "./ten-gods";
import type { FourPillars, DaeunInfo, SeunInfo, Gender } from "@/lib/types";

/**
 * Determine daeun direction: forward (순행) or backward (역행).
 * Male + 양간 = forward, Male + 음간 = backward, Female = opposite
 */
function getDaeunDirection(gender: Gender, yearStem: string): "forward" | "backward" {
  const isYang = STEM_YINYANG[yearStem] === "양";
  if (gender === "male") return isYang ? "forward" : "backward";
  return isYang ? "backward" : "forward";
}

/**
 * Get the next or previous stem in the 10-stem cycle.
 */
function shiftStem(stem: string, delta: number): string {
  const idx = STEMS_HANGUL.indexOf(stem as (typeof STEMS_HANGUL)[number]);
  return STEMS_HANGUL[((idx + delta) % 10 + 10) % 10];
}

/**
 * Get the next or previous branch in the 12-branch cycle.
 */
function shiftBranch(branch: string, delta: number): string {
  const idx = BRANCHES_HANGUL.indexOf(branch as (typeof BRANCHES_HANGUL)[number]);
  return BRANCHES_HANGUL[((idx + delta) % 12 + 12) % 12];
}

/**
 * Compute the daeun start age.
 * Simplified: uses approximate days to next/prev 절기.
 * In the POC, we estimate based on birth month/day.
 */
function computeStartAge(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  direction: "forward" | "backward"
): number {
  // Approximate 절기 dates (절기 occurs ~5th of each month solar)
  // Each month has a 절 around the 5th-7th
  const jeolgiDays = [6, 4, 6, 5, 6, 6, 7, 8, 8, 8, 7, 6]; // approximate day of jeolgi per month (1-indexed)

  const currentMonthJeolgi = jeolgiDays[birthMonth - 1] || 6;

  let daysToJeolgi: number;
  if (direction === "forward") {
    // Days to next 절기
    if (birthDay < currentMonthJeolgi) {
      daysToJeolgi = currentMonthJeolgi - birthDay;
    } else {
      // Next month's 절기
      const nextMonth = birthMonth === 12 ? 1 : birthMonth + 1;
      const nextJeolgi = jeolgiDays[nextMonth - 1] || 6;
      const daysInMonth = new Date(birthYear, birthMonth, 0).getDate();
      daysToJeolgi = (daysInMonth - birthDay) + nextJeolgi;
    }
  } else {
    // Days to previous 절기
    if (birthDay > currentMonthJeolgi) {
      daysToJeolgi = birthDay - currentMonthJeolgi;
    } else {
      // Previous month's 절기
      const prevMonth = birthMonth === 1 ? 12 : birthMonth - 1;
      const prevJeolgi = jeolgiDays[prevMonth - 1] || 6;
      const daysInPrevMonth = new Date(birthYear, birthMonth - 1, 0).getDate();
      daysToJeolgi = birthDay + (daysInPrevMonth - prevJeolgi);
    }
  }

  // Days / 3 = start age (remainder 0,1 → floor, 2 → ceil)
  const remainder = daysToJeolgi % 3;
  let startAge = Math.floor(daysToJeolgi / 3);
  if (remainder === 2) startAge += 1;

  return Math.max(1, startAge);
}

/**
 * Compute the full list of 대운 (major fortune cycles).
 */
export function computeDaeunList(
  pillars: FourPillars,
  gender: Gender,
  birthYear: number,
  birthMonth: number,
  birthDay: number,
): DaeunInfo[] {
  const direction = getDaeunDirection(gender, pillars.year.stem);
  const startAge = computeStartAge(birthYear, birthMonth, birthDay, direction);
  const delta = direction === "forward" ? 1 : -1;
  const dayStem = pillars.day.stem;

  const list: DaeunInfo[] = [];
  for (let i = 0; i < 8; i++) {
    const stem = shiftStem(pillars.month.stem, delta * (i + 1));
    const branch = shiftBranch(pillars.month.branch, delta * (i + 1));

    list.push({
      stem,
      branch,
      stemHanja: STEM_HANGUL_TO_HANJA[stem],
      branchHanja: BRANCH_HANGUL_TO_HANJA[branch],
      startAge: startAge + i * 10,
      endAge: startAge + (i + 1) * 10 - 1,
      tenGod: getTenGod(dayStem, stem),
    });
  }

  return list;
}

/**
 * Find the current daeun based on age.
 */
export function getCurrentDaeun(daeunList: DaeunInfo[], age: number): DaeunInfo {
  for (const d of daeunList) {
    if (age >= d.startAge && age <= d.endAge) return d;
  }
  return daeunList[0]; // fallback to first
}

/**
 * Compute seun (yearly fortune) for a given year.
 */
export function computeSeun(year: number, dayStem: string): SeunInfo {
  // 60 ganji cycle: 갑자 = 1984, so offset from there
  const base = 1984; // 갑자년
  const diff = ((year - base) % 60 + 60) % 60;
  const stem = STEMS_HANGUL[diff % 10];
  const branch = BRANCHES_HANGUL[diff % 12];

  return {
    year,
    stem,
    branch,
    stemHanja: STEM_HANGUL_TO_HANJA[stem],
    branchHanja: BRANCH_HANGUL_TO_HANJA[branch],
    tenGod: getTenGod(dayStem, stem),
  };
}
