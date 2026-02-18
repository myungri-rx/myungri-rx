// 천간 (Heavenly Stems)
export const STEMS_HANGUL = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"] as const;
export const STEMS_HANJA = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;

// 지지 (Earthly Branches)
export const BRANCHES_HANGUL = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"] as const;
export const BRANCHES_HANJA = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;

export type StemHangul = (typeof STEMS_HANGUL)[number];
export type StemHanja = (typeof STEMS_HANJA)[number];
export type BranchHangul = (typeof BRANCHES_HANGUL)[number];
export type BranchHanja = (typeof BRANCHES_HANJA)[number];

// Hangul ↔ Hanja maps
export const STEM_HANGUL_TO_HANJA: Record<string, string> = {};
export const STEM_HANJA_TO_HANGUL: Record<string, string> = {};
STEMS_HANGUL.forEach((h, i) => {
  STEM_HANGUL_TO_HANJA[h] = STEMS_HANJA[i];
  STEM_HANJA_TO_HANGUL[STEMS_HANJA[i]] = h;
});

export const BRANCH_HANGUL_TO_HANJA: Record<string, string> = {};
export const BRANCH_HANJA_TO_HANGUL: Record<string, string> = {};
BRANCHES_HANGUL.forEach((h, i) => {
  BRANCH_HANGUL_TO_HANJA[h] = BRANCHES_HANJA[i];
  BRANCH_HANJA_TO_HANGUL[BRANCHES_HANJA[i]] = h;
});

// Ohaeng (Five Elements) mapping
export type OhaengName = "목" | "화" | "토" | "금" | "수";
export type OhaengKey = "wood" | "fire" | "earth" | "metal" | "water";

export const STEM_TO_OHAENG: Record<string, OhaengName> = {
  갑: "목", 을: "목",
  병: "화", 정: "화",
  무: "토", 기: "토",
  경: "금", 신: "금",
  임: "수", 계: "수",
};

export const BRANCH_TO_OHAENG: Record<string, OhaengName> = {
  인: "목", 묘: "목",
  사: "화", 오: "화",
  진: "토", 술: "토", 축: "토", 미: "토",
  신: "금", 유: "금",
  해: "수", 자: "수",
};

export const OHAENG_NAME_TO_KEY: Record<OhaengName, OhaengKey> = {
  목: "wood", 화: "fire", 토: "earth", 금: "metal", 수: "water",
};

export const OHAENG_KEY_TO_NAME: Record<OhaengKey, OhaengName> = {
  wood: "목", fire: "화", earth: "토", metal: "금", water: "수",
};

// Yin/Yang of stems
export const STEM_YINYANG: Record<string, "양" | "음"> = {
  갑: "양", 을: "음",
  병: "양", 정: "음",
  무: "양", 기: "음",
  경: "양", 신: "음",
  임: "양", 계: "음",
};

// 60 Ganji cycle (갑자순)
export const GANJI_60: string[] = [];
for (let i = 0; i < 60; i++) {
  GANJI_60.push(STEMS_HANGUL[i % 10] + BRANCHES_HANGUL[i % 12]);
}

// Ohaeng interaction
export const OHAENG_SANG_SAENG: Record<OhaengName, OhaengName> = {
  목: "화", 화: "토", 토: "금", 금: "수", 수: "목",
};

export const OHAENG_SANG_GEUK: Record<OhaengName, OhaengName> = {
  목: "토", 토: "수", 수: "화", 화: "금", 금: "목",
};
