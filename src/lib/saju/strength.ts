import {
  STEM_TO_OHAENG,
  BRANCH_TO_OHAENG,
  OHAENG_NAME_TO_KEY,
  OHAENG_SANG_SAENG,
  OHAENG_SANG_GEUK,
  type OhaengName,
} from "@/lib/constants/stems-branches";
import { WANGJI_STAGES, SAJEOLJI_STAGES } from "@/lib/constants/twelve-stages";
import { HIDDEN_STEMS_TABLE } from "@/lib/constants/hidden-stems";
import { TEN_GOD_GROUPS } from "@/lib/constants/ten-gods";
import { getTenGod } from "./ten-gods";
import { getTwelveStage } from "./twelve-stages";
import type { FourPillars, TenGods, DayMasterStrength } from "@/lib/types";

/**
 * Simplified 신강/신약 판단
 * Based on: 월령 지지, 통근(지지에서의 지지 오행), 천간 비겁/인성 존재
 */
export function determineDayMasterStrength(
  pillars: FourPillars,
  tenGods: TenGods,
): DayMasterStrength {
  const dayStem = pillars.day.stem;
  let strongPoints = 0;
  let weakPoints = 0;

  // 1. Check 월령 (month branch) 12운성
  const monthStage = getTwelveStage(dayStem, pillars.month.branch);
  if ((WANGJI_STAGES as readonly string[]).includes(monthStage)) {
    strongPoints += 2;
  } else if ((SAJEOLJI_STAGES as readonly string[]).includes(monthStage)) {
    weakPoints += 2;
  }

  // 2. Count 비겁 (비견/겁재) in stems
  const bigyeop = TEN_GOD_GROUPS["비겁"];
  const stems = [tenGods.yearStem, tenGods.monthStem];
  if (tenGods.hourStem) stems.push(tenGods.hourStem);
  for (const s of stems) {
    if (bigyeop.includes(s as (typeof bigyeop)[number])) strongPoints += 1;
  }

  // 3. Count 인성 (편인/정인) in stems
  const insung = TEN_GOD_GROUPS["인성"];
  for (const s of stems) {
    if (insung.includes(s as (typeof insung)[number])) strongPoints += 1;
  }

  // 4. Count 관성/식상/재성 in stems (weakening factors)
  const weakening = [...TEN_GOD_GROUPS["관성"], ...TEN_GOD_GROUPS["식상"], ...TEN_GOD_GROUPS["재성"]];
  for (const s of stems) {
    if (weakening.includes(s as (typeof weakening)[number])) weakPoints += 1;
  }

  // 5. Check 통근 (roots in branches)
  const dayOhaeng = STEM_TO_OHAENG[dayStem];
  const branches = [pillars.year.branch, pillars.month.branch, pillars.day.branch];
  if (pillars.hour) branches.push(pillars.hour.branch);

  for (const branch of branches) {
    const hiddenStems = HIDDEN_STEMS_TABLE[branch] || [];
    for (const hs of hiddenStems) {
      if (STEM_TO_OHAENG[hs] === dayOhaeng) {
        strongPoints += 0.5;
      }
    }
  }

  if (strongPoints >= weakPoints + 2) return "strong";
  if (weakPoints >= strongPoints + 2) return "weak";
  return "neutral";
}

/**
 * Simplified 용신/희신/기신 determination based on strength.
 */
export function determineYongShin(
  dayStem: string,
  strength: DayMasterStrength,
): { yongShin: string; huiShin: string; giShin: string } {
  const dayOhaeng = STEM_TO_OHAENG[dayStem];

  if (strength === "strong") {
    // Strong → needs to drain: 식상 produces 재성, so yongshin = element I produce
    const yongShinOhaeng = OHAENG_SANG_SAENG[dayOhaeng]; // 식상 오행
    const huiShinOhaeng = OHAENG_SANG_SAENG[yongShinOhaeng]; // 재성 오행
    const giShinOhaeng = dayOhaeng; // same element is harmful
    return {
      yongShin: yongShinOhaeng,
      huiShin: huiShinOhaeng,
      giShin: giShinOhaeng,
    };
  } else if (strength === "weak") {
    // Weak → needs support: 인성 or 비겁
    // yongshin = element that produces me (인성)
    const producesMe = Object.entries(OHAENG_SANG_SAENG).find(
      ([, v]) => v === dayOhaeng,
    );
    const yongShinOhaeng = producesMe ? producesMe[0] as OhaengName : dayOhaeng;
    const huiShinOhaeng = dayOhaeng; // 비겁 (same element)
    const giShinOhaeng = OHAENG_SANG_GEUK[dayOhaeng]; // element I try to control (재성)
    return {
      yongShin: yongShinOhaeng,
      huiShin: huiShinOhaeng,
      giShin: giShinOhaeng,
    };
  }

  // Neutral → balance approach
  const yongShinOhaeng = OHAENG_SANG_SAENG[dayOhaeng];
  const producesMe = Object.entries(OHAENG_SANG_SAENG).find(
    ([, v]) => v === dayOhaeng,
  );
  return {
    yongShin: yongShinOhaeng,
    huiShin: producesMe ? producesMe[0] : dayOhaeng,
    giShin: OHAENG_SANG_GEUK[dayOhaeng],
  };
}
