import {
  calculateSaju,
  lunarToSolar,
} from "@fullstackfamily/manseryeok";
import { parsePillar, pillarToHanja } from "./pillar-parser";
import { calculateMonthPillar, getSajuYear } from "./solar-terms";
import { computeTenGods } from "./ten-gods";
import { computeFiveElements, getDominantElement, getWeakestElement } from "./five-elements";
import { computeTwelveStages } from "./twelve-stages";
import { computeHiddenStems } from "./hidden-stems";
import { computeBranchRelations } from "./branch-relations";
import { detectSpirits, detectEmptiness } from "./spirits";
import { computeDaeunList, getCurrentDaeun, computeSeun } from "./daeun";
import { determineDayMasterStrength, determineYongShin } from "./strength";
import type { SajuInput, FourPillars, FourPillarsHanja, SajuAnalysisData } from "@/lib/types";

const CURRENT_YEAR = 2026;

// 지지 → 띠 매핑 (자→쥐, 축→소, ...)
const BRANCH_TO_ZODIAC: Record<string, string> = {
  "자": "쥐", "축": "소", "인": "호랑이", "묘": "토끼",
  "진": "용", "사": "뱀", "오": "말", "미": "양",
  "신": "원숭이", "유": "닭", "술": "개", "해": "돼지",
};

/**
 * Convert lunar date to solar date if needed.
 */
function toSolarDate(input: SajuInput): { year: number; month: number; day: number } {
  const [year, month, day] = input.birthDate.split("-").map(Number);

  if (input.calendarType === "lunar") {
    const result = lunarToSolar(year, month, day, input.isLeapMonth || false);
    return {
      year: result.solar.year,
      month: result.solar.month,
      day: result.solar.day,
    };
  }

  return { year, month, day };
}

/**
 * Main entry point: calculate full saju analysis data.
 */
export function calculateFullSaju(input: SajuInput): SajuAnalysisData {
  const solar = toSolarDate(input);
  const birthTimeKnown = input.birthTime !== "모름";

  let hour: number | undefined;
  let minute: number | undefined;
  if (birthTimeKnown) {
    const [h, m] = input.birthTime.split(":").map(Number);
    hour = h;
    minute = m;
  }

  // Call manseryeok library (for year/day/hour pillars)
  const sajuResult = calculateSaju(
    solar.year,
    solar.month,
    solar.day,
    hour,
    minute,
  );

  // Parse year pillar from manseryeok
  const yearPillar = parsePillar(sajuResult.yearPillar);

  // Check if saju year differs (before 입춘 → use previous year)
  const sajuYear = getSajuYear(solar.year, solar.month, solar.day, hour ?? 0, minute ?? 0);
  // If saju year differs from calendar year, recalculate year pillar with manseryeok
  // using the saju year's data. The year pillar is based on the 60 ganji cycle.
  let correctedYearPillar = yearPillar;
  if (sajuYear !== solar.year) {
    // Recalculate using a date we know is in the previous year
    const prevYearResult = calculateSaju(sajuYear, 6, 15, 12, 0);
    correctedYearPillar = parsePillar(prevYearResult.yearPillar);
  }

  // Calculate month pillar using our 절기-based algorithm
  const monthPillarData = calculateMonthPillar(
    correctedYearPillar.stem,
    solar.year,
    solar.month,
    solar.day,
    hour ?? 0,
    minute ?? 0,
  );

  // Parse pillars
  const fourPillars: FourPillars = {
    year: correctedYearPillar,
    month: { stem: monthPillarData.stem, branch: monthPillarData.branch },
    day: parsePillar(sajuResult.dayPillar),
    hour: sajuResult.hourPillar ? parsePillar(sajuResult.hourPillar) : undefined,
  };

  const fourPillarsHanja: FourPillarsHanja = {
    year: pillarToHanja(fourPillars.year),
    month: pillarToHanja(fourPillars.month),
    day: pillarToHanja(fourPillars.day),
    hour: fourPillars.hour ? pillarToHanja(fourPillars.hour) : undefined,
  };

  // Compute derived data
  const tenGods = computeTenGods(fourPillars);
  const fiveElements = computeFiveElements(fourPillars);
  const twelveStages = computeTwelveStages(fourPillars);
  const hiddenStems = computeHiddenStems(fourPillars);
  const branchRelations = computeBranchRelations(fourPillars);
  const spirits = detectSpirits(fourPillars);
  const emptiness = detectEmptiness(fourPillars);

  // Daeun & Seun
  const daeunList = computeDaeunList(
    fourPillars,
    input.gender,
    solar.year,
    solar.month,
    solar.day,
  );

  const age = CURRENT_YEAR - solar.year + 1; // Korean age
  const currentDaeun = getCurrentDaeun(daeunList, age);
  const currentSeun = computeSeun(CURRENT_YEAR, fourPillars.day.stem);
  const nextSeun = computeSeun(CURRENT_YEAR + 1, fourPillars.day.stem);

  // Strength & Yongshin
  const dayMasterStrength = determineDayMasterStrength(fourPillars, tenGods);
  const { yongShin, huiShin, giShin } = determineYongShin(
    fourPillars.day.stem,
    dayMasterStrength,
  );

  return {
    input,
    zodiacAnimal: BRANCH_TO_ZODIAC[correctedYearPillar.branch] || "",
    fourPillars,
    fourPillarsHanja,
    fiveElements,
    dominantElement: getDominantElement(fiveElements),
    weakestElement: getWeakestElement(fiveElements),
    tenGods,
    branchRelations,
    hiddenStems,
    twelveStages,
    spirits,
    emptiness,
    daeunList,
    currentDaeun,
    currentSeun,
    nextSeun,
    dayMasterStrength,
    yongShin,
    huiShin,
    giShin,
  };
}
