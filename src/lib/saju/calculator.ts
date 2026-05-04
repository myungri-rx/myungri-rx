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
import { STEMS_HANGUL, BRANCHES_HANGUL } from "@/lib/constants/stems-branches";
import type { SajuInput, Pillar, FourPillars, FourPillarsHanja, SajuAnalysisData } from "@/lib/types";

const CURRENT_YEAR = 2026;

// 오자시두법: 일간 → 자시 천간의 STEMS_HANGUL 인덱스
const HOUR_STEM_START: Record<string, number> = {
  "갑": 0, "기": 0,  // 갑자시
  "을": 2, "경": 2,  // 병자시
  "병": 4, "신": 4,  // 무자시
  "정": 6, "임": 6,  // 경자시
  "무": 8, "계": 8,  // 임자시
};

/**
 * 30분 기준(초정법) 시지 인덱스 산출
 * 자시 23:30~01:30, 축시 01:30~03:30, ... 해시 21:30~23:30
 */
function getHourBranchIndex(hour: number, minute: number): number {
  const total = hour * 60 + minute;
  if (total >= 1410 || total < 90) return 0;   // 자시
  if (total < 210) return 1;   // 축시
  if (total < 330) return 2;   // 인시
  if (total < 450) return 3;   // 묘시
  if (total < 570) return 4;   // 진시
  if (total < 690) return 5;   // 사시
  if (total < 810) return 6;   // 오시
  if (total < 930) return 7;   // 미시
  if (total < 1050) return 8;  // 신시
  if (total < 1170) return 9;  // 유시
  if (total < 1290) return 10; // 술시
  return 11;                    // 해시
}

/**
 * 시주 계산 (30분 기준 + 오자시두법)
 */
function computeHourPillar(dayStem: string, hour: number, minute: number): Pillar {
  const branchIdx = getHourBranchIndex(hour, minute);
  const stemStart = HOUR_STEM_START[dayStem];
  const stemIdx = (stemStart + branchIdx) % 10;
  return {
    stem: STEMS_HANGUL[stemIdx],
    branch: BRANCHES_HANGUL[branchIdx],
  };
}

/**
 * 야자시 판별: 23:30 이후는 다음날 자시
 */
function isYajasi(hour: number, minute: number): boolean {
  return hour === 23 && minute >= 30;
}

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

  // Call manseryeok library (for year/day pillars — hour pillar is computed separately)
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
  let correctedYearPillar = yearPillar;
  if (sajuYear !== solar.year) {
    const prevYearResult = calculateSaju(sajuYear, 6, 15, 12, 0);
    correctedYearPillar = parsePillar(prevYearResult.yearPillar);
  }

  // 야자시(23:30+) 처리: 다음날 일주 사용
  let dayPillar = parsePillar(sajuResult.dayPillar);
  if (birthTimeKnown && hour !== undefined && minute !== undefined && isYajasi(hour, minute)) {
    const nextDate = new Date(solar.year, solar.month - 1, solar.day + 1);
    const nextDayResult = calculateSaju(
      nextDate.getFullYear(),
      nextDate.getMonth() + 1,
      nextDate.getDate(),
      12, 0,
    );
    dayPillar = parsePillar(nextDayResult.dayPillar);
  }

  // 시주 계산: 30분 기준(초정법) 직접 산출
  let hourPillar: Pillar | undefined;
  if (birthTimeKnown && hour !== undefined && minute !== undefined) {
    hourPillar = computeHourPillar(dayPillar.stem, hour, minute);
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

  // Assemble four pillars
  const fourPillars: FourPillars = {
    year: correctedYearPillar,
    month: { stem: monthPillarData.stem, branch: monthPillarData.branch },
    day: dayPillar,
    hour: hourPillar,
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
