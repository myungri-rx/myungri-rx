// 신살 판정 기준 (SAJU_REFERENCE.md §4-11)

import { SAMHAP_GROUPS } from "./branch-relations";

// 도화살 (Peach Blossom) - based on day branch or year branch
// 인오술→卯, 사유축→午, 신자진→酉, 해묘미→子
export const DOHWA_TABLE: Record<string, string> = {
  인: "묘", 오: "묘", 술: "묘",
  사: "오", 유: "오", 축: "오",
  신: "유", 자: "유", 진: "유",
  해: "자", 묘: "자", 미: "자",
};

// 역마살 (Travel Star) - based on day branch or year branch
// 인오술→申, 사유축→亥, 신자진→寅, 해묘미→巳
export const YEOKMA_TABLE: Record<string, string> = {
  인: "신", 오: "신", 술: "신",
  사: "해", 유: "해", 축: "해",
  신: "인", 자: "인", 진: "인",
  해: "사", 묘: "사", 미: "사",
};

// 화개살 (Canopy Star) - based on day branch or year branch
// 인오술→戌, 사유축→丑, 신자진→辰, 해묘미→未
export const HWAGAE_TABLE: Record<string, string> = {
  인: "술", 오: "술", 술: "술",
  사: "축", 유: "축", 축: "축",
  신: "진", 자: "진", 진: "진",
  해: "미", 묘: "미", 미: "미",
};

// 천을귀인 (Noble Helper) - based on day stem
// 갑무경→축미, 을기→자신, 병정→해유, 임계→묘사, 신→오인
export const CHEONEUL_TABLE: Record<string, string[]> = {
  갑: ["축", "미"],
  무: ["축", "미"],
  경: ["축", "미"],
  을: ["자", "신"],
  기: ["자", "신"],
  병: ["해", "유"],
  정: ["해", "유"],
  임: ["묘", "사"],
  계: ["묘", "사"],
  신: ["오", "인"],
};

// 양인 (Yang Blade) - based on day stem
export const YANGIN_TABLE: Record<string, string> = {
  갑: "묘", 을: "인",
  병: "오", 정: "사",
  무: "오", 기: "사",
  경: "유", 신: "신",
  임: "자", 계: "해",
};

// 공망 (Emptiness) - based on day pillar's 순 (cycle of 10)
// Each 순 (10-day cycle) has 2 empty branches
export const GONGMANG_TABLE: Record<string, string[]> = {
  갑자: ["술", "해"], 갑술: ["신", "유"], 갑신: ["오", "미"],
  갑오: ["진", "사"], 갑진: ["인", "묘"], 갑인: ["자", "축"],
};

// Helper: find which 순 a day pillar belongs to
export function getGongmangBranches(dayStem: string, dayBranch: string): string[] {
  const stems = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];
  const branches = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];

  const stemIdx = stems.indexOf(dayStem);
  const branchIdx = branches.indexOf(dayBranch);
  if (stemIdx === -1 || branchIdx === -1) return [];

  // Go backwards to find the 갑 (start of cycle)
  const offset = stemIdx; // how far from 갑
  const startBranchIdx = (branchIdx - offset + 12) % 12;
  const cycleKey = "갑" + branches[startBranchIdx];

  return GONGMANG_TABLE[cycleKey] || [];
}

// 홍염살 (Red Flame) - based on day stem
export const HONGYEOM_TABLE: Record<string, string> = {
  갑: "오", 을: "신", 병: "인", 정: "미",
  무: "진", 기: "진", 경: "술", 신: "유",
  임: "자", 계: "신",
};

// 천희성 (Heavenly Joy) - based on year branch
export const CHEONHEE_TABLE: Record<string, string> = {
  자: "유", 축: "신", 인: "미", 묘: "오",
  진: "사", 사: "진", 오: "묘", 미: "인",
  신: "축", 유: "자", 술: "해", 해: "술",
};

// 천덕귀인 (Heavenly Virtue Noble) - based on month branch
export const CHEONDUK_TABLE: Record<string, string> = {
  인: "정", 묘: "신", 진: "임", 사: "신",
  오: "해", 미: "갑", 신: "계", 유: "인",
  술: "병", 해: "을", 자: "사", 축: "경",
};

// 월덕귀인 (Monthly Virtue Noble) - based on month branch
export const WOLDUK_TABLE: Record<string, string> = {
  인: "병", 오: "병", 술: "병",
  신: "임", 자: "임", 진: "임",
  해: "갑", 묘: "갑", 미: "갑",
  사: "경", 유: "경", 축: "경",
};
