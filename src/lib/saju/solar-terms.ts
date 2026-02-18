/**
 * Solar term (절기) calculator using simplified VSOP87 / Meeus algorithm.
 * Calculates the 12 절(節) dates that determine saju month boundaries.
 *
 * Month boundaries (절기 → 지지):
 *   입춘(315°)→寅, 경칩(345°)→卯, 청명(15°)→辰, 입하(45°)→巳,
 *   망종(75°)→午, 소서(105°)→未, 입추(135°)→申, 백로(165°)→酉,
 *   한로(195°)→戌, 입동(225°)→亥, 대설(255°)→子, 소한(285°)→丑
 */

import { STEMS_HANGUL, BRANCHES_HANGUL } from "@/lib/constants/stems-branches";

/** The 12 절(節) that define month boundaries, in chronological order within a year. */
const JEOL_DEFINITIONS = [
  { name: "소한", longitude: 285, branchIndex: 1 },   // 축월 (Jan ~6)
  { name: "입춘", longitude: 315, branchIndex: 2 },   // 인월 (Feb ~4)
  { name: "경칩", longitude: 345, branchIndex: 3 },   // 묘월 (Mar ~6)
  { name: "청명", longitude: 15, branchIndex: 4 },    // 진월 (Apr ~5)
  { name: "입하", longitude: 45, branchIndex: 5 },    // 사월 (May ~6)
  { name: "망종", longitude: 75, branchIndex: 6 },    // 오월 (Jun ~6)
  { name: "소서", longitude: 105, branchIndex: 7 },   // 미월 (Jul ~7)
  { name: "입추", longitude: 135, branchIndex: 8 },   // 신월 (Aug ~8)
  { name: "백로", longitude: 165, branchIndex: 9 },   // 유월 (Sep ~8)
  { name: "한로", longitude: 195, branchIndex: 10 },  // 술월 (Oct ~8)
  { name: "입동", longitude: 225, branchIndex: 11 },  // 해월 (Nov ~7)
  { name: "대설", longitude: 255, branchIndex: 0 },   // 자월 (Dec ~7)
];

/**
 * Convert a Date to Julian Day Number.
 */
function dateToJD(year: number, month: number, day: number, hour: number = 0, minute: number = 0): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + (hour + minute / 60) / 24 + B - 1524.5;
}

/**
 * Convert Julian Day Number back to Date components.
 */
function jdToDate(jd: number): { year: number; month: number; day: number; hour: number; minute: number } {
  const z = Math.floor(jd + 0.5);
  const f = jd + 0.5 - z;
  let A: number;
  if (z < 2299161) {
    A = z;
  } else {
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    A = z + 1 + alpha - Math.floor(alpha / 4);
  }
  const B = A + 1524;
  const C = Math.floor((B - 122.1) / 365.25);
  const D = Math.floor(365.25 * C);
  const E = Math.floor((B - D) / 30.6001);

  const day = B - D - Math.floor(30.6001 * E);
  const month = E < 14 ? E - 1 : E - 13;
  const year = month > 2 ? C - 4716 : C - 4715;

  const totalHours = f * 24;
  const hour = Math.floor(totalHours);
  const minute = Math.round((totalHours - hour) * 60);

  return { year, month, day, hour, minute };
}

/**
 * Calculate the Sun's apparent longitude for a given Julian Day.
 * Simplified VSOP87 / Meeus Chapter 25.
 */
function sunLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0; // Julian centuries from J2000.0

  // Geometric mean longitude of the Sun (degrees)
  let L0 = 280.46646 + T * (36000.76983 + T * 0.0003032);
  L0 = ((L0 % 360) + 360) % 360;

  // Mean anomaly of the Sun (degrees)
  let M = 357.52911 + T * (35999.05029 - T * 0.0001537);
  M = ((M % 360) + 360) % 360;
  const Mrad = M * Math.PI / 180;

  // Equation of center
  const C = (1.914602 - T * (0.004817 + T * 0.000014)) * Math.sin(Mrad)
    + (0.019993 - T * 0.000101) * Math.sin(2 * Mrad)
    + 0.000289 * Math.sin(3 * Mrad);

  // Sun's true longitude
  let sunLon = L0 + C;

  // Apparent longitude (nutation + aberration correction)
  const omega = 125.04 - 1934.136 * T;
  const omegaRad = omega * Math.PI / 180;
  sunLon = sunLon - 0.00569 - 0.00478 * Math.sin(omegaRad);

  return ((sunLon % 360) + 360) % 360;
}

/**
 * Find the Julian Day when the Sun reaches a target longitude,
 * starting from an approximate JD, using Newton-Raphson iteration.
 */
function findSolarTermJD(targetLongitude: number, approxJD: number): number {
  let jd = approxJD;

  for (let i = 0; i < 50; i++) {
    const lon = sunLongitude(jd);
    let diff = targetLongitude - lon;

    // Handle wrap-around at 0°/360°
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    if (Math.abs(diff) < 0.0001) break; // ~0.35 seconds accuracy

    // Sun moves ~1° per day
    jd += diff / 360 * 365.25;
  }

  return jd;
}

export interface JeolgiDate {
  name: string;
  branchIndex: number;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  jd: number;
}

/**
 * Calculate all 12 절(節) dates for a given year.
 * Returns dates in chronological order (소한 Jan → 대설 Dec).
 */
export function getJeolgiDates(year: number): JeolgiDate[] {
  const results: JeolgiDate[] = [];

  for (const jeol of JEOL_DEFINITIONS) {
    // Approximate month for initial guess
    const approxMonths: Record<string, number> = {
      소한: 1, 입춘: 2, 경칩: 3, 청명: 4,
      입하: 5, 망종: 6, 소서: 7, 입추: 8,
      백로: 9, 한로: 10, 입동: 11, 대설: 12,
    };
    const approxMonth = approxMonths[jeol.name];
    const approxJD = dateToJD(year, approxMonth, 6, 0, 0);
    const jd = findSolarTermJD(jeol.longitude, approxJD);
    const date = jdToDate(jd);

    results.push({
      name: jeol.name,
      branchIndex: jeol.branchIndex,
      year: date.year,
      month: date.month,
      day: date.day,
      hour: date.hour,
      minute: date.minute,
      jd,
    });
  }

  return results;
}

/**
 * Determine the saju month branch index for a given solar date + time.
 * Returns the earthly branch index (0=자 ~ 11=해).
 *
 * The saju month changes at the exact moment of the 절기.
 * We need to check the 절기 dates of the current year and possibly the previous year's 대설.
 */
export function getSajuMonthBranchIndex(
  year: number,
  month: number,
  day: number,
  hour: number = 0,
  minute: number = 0
): number {
  // Birth time is in KST (UTC+9), convert to UTC for comparison with solar term JDs
  const birthJD = dateToJD(year, month, day, hour - 9, minute);

  // Get 절기 dates for this year
  const thisYearJeolgi = getJeolgiDates(year);
  // Also need previous year's 대설 (자월 start) for early January dates
  const prevYearJeolgi = getJeolgiDates(year - 1);

  // Build a combined list: previous year's 대설 + this year's all 절기
  const allJeolgi: JeolgiDate[] = [
    prevYearJeolgi[prevYearJeolgi.length - 1], // 대설 of previous year
    ...thisYearJeolgi,
  ];

  // Find which 절기 period we're in: walk backwards from the end
  for (let i = allJeolgi.length - 1; i >= 0; i--) {
    if (birthJD >= allJeolgi[i].jd) {
      return allJeolgi[i].branchIndex;
    }
  }

  // If before all 절기 in the list, we're in the previous year's 대설 period
  // This shouldn't happen with our setup, but fallback
  return prevYearJeolgi[prevYearJeolgi.length - 1].branchIndex;
}

/**
 * 년간별 월주 천간 산출표
 * Year stem → first month (인월) stem index
 * 갑/기 → 병(2), 을/경 → 무(4), 병/신 → 경(6), 정/임 → 임(8), 무/계 → 갑(0)
 */
const YEAR_STEM_TO_MONTH_STEM_START: Record<string, number> = {
  갑: 2, 기: 2,  // 병
  을: 4, 경: 4,  // 무
  병: 6, 신: 6,  // 경
  정: 8, 임: 8,  // 임
  무: 0, 계: 0,  // 갑
};

/**
 * Calculate the correct month pillar (stem + branch) based on 절기.
 *
 * @param yearStem - The year pillar's heavenly stem (hangul)
 * @param year - Solar year
 * @param month - Solar month
 * @param day - Solar day
 * @param hour - Solar hour (0-23)
 * @param minute - Solar minute (0-59)
 */
export function calculateMonthPillar(
  yearStem: string,
  year: number,
  month: number,
  day: number,
  hour: number = 0,
  minute: number = 0,
): { stem: string; branch: string } {
  const branchIndex = getSajuMonthBranchIndex(year, month, day, hour, minute);

  // Month stem: determined by year stem and month branch
  // 인월(index=2) = first month of the year
  // The stem for 인월 is determined by YEAR_STEM_TO_MONTH_STEM_START
  const inMonthStemIndex = YEAR_STEM_TO_MONTH_STEM_START[yearStem];
  if (inMonthStemIndex === undefined) {
    throw new Error(`Unknown year stem: ${yearStem}`);
  }

  // offset from 인월(2): branchIndex is 0-based where 자=0, 축=1, 인=2 ...
  // 인월 offset=0, 묘월 offset=1, 진월 offset=2, ... 축월 offset=11
  let monthOffset = branchIndex - 2;
  if (monthOffset < 0) monthOffset += 12;

  const stemIndex = (inMonthStemIndex + monthOffset) % 10;

  return {
    stem: STEMS_HANGUL[stemIndex],
    branch: BRANCHES_HANGUL[branchIndex],
  };
}

/**
 * Also determine the saju year: the saju year changes at 입춘, not Jan 1.
 * If the birth date is before 입춘 of the given year, use the previous year.
 */
export function getSajuYear(
  year: number,
  month: number,
  day: number,
  hour: number = 0,
  minute: number = 0,
): number {
  // Birth time is in KST (UTC+9), convert to UTC
  const birthJD = dateToJD(year, month, day, hour - 9, minute);
  const thisYearJeolgi = getJeolgiDates(year);
  // 입춘 is the second 절기 in our list (index 1)
  const ipchunJD = thisYearJeolgi[1].jd;

  return birthJD < ipchunJD ? year - 1 : year;
}
