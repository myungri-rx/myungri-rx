// 지지 관계 (SAJU_REFERENCE.md §4-3)

// 삼합 (Three Harmonies) - groups of 3 branches forming an element
export const SAMHAP_GROUPS: { branches: string[]; element: string }[] = [
  { branches: ["인", "오", "술"], element: "화" },
  { branches: ["사", "유", "축"], element: "금" },
  { branches: ["신", "자", "진"], element: "수" },
  { branches: ["해", "묘", "미"], element: "목" },
];

// 육합 (Six Harmonies) - pairs
export const YUKHAP_PAIRS: [string, string][] = [
  ["자", "축"],
  ["인", "해"],
  ["묘", "술"],
  ["진", "유"],
  ["사", "신"],
  ["오", "미"],
];

// 방합 (Directional Harmony) - groups of 3 in same direction
export const BANGHAP_GROUPS: { branches: string[]; direction: string; element: string }[] = [
  { branches: ["인", "묘", "진"], direction: "동", element: "목" },
  { branches: ["사", "오", "미"], direction: "남", element: "화" },
  { branches: ["신", "유", "술"], direction: "서", element: "금" },
  { branches: ["해", "자", "축"], direction: "북", element: "수" },
];

// 충 (Clash) - opposing pairs
export const CHUNG_PAIRS: [string, string][] = [
  ["자", "오"],
  ["축", "미"],
  ["인", "신"],
  ["묘", "유"],
  ["진", "술"],
  ["사", "해"],
];

// 형 (Punishment)
export const HYUNG_GROUPS: { branches: string[]; name: string }[] = [
  { branches: ["인", "사", "신"], name: "무은지형" },
  { branches: ["축", "술", "미"], name: "지세지형" },
  { branches: ["자", "묘"], name: "무례지형" },
];
// 자형 (Self-punishment)
export const JAHYUNG_BRANCHES = ["진", "오", "유", "해"] as const;

// 해 (Harm)
export const HAE_PAIRS: [string, string][] = [
  ["자", "미"],
  ["축", "오"],
  ["인", "사"],
  ["묘", "진"],
  ["신", "해"],
  ["유", "술"],
];

// 파 (Break)
export const PA_PAIRS: [string, string][] = [
  ["자", "유"],
  ["축", "진"],
  ["인", "해"],
  ["묘", "오"],
  ["사", "신"],
  ["술", "미"],
];

// 원진 (Resentment)
export const WONJIN_PAIRS: [string, string][] = [
  ["자", "미"],
  ["축", "오"],
  ["인", "유"],
  ["묘", "신"],
  ["진", "해"],
  ["사", "술"],
];

// 천간합 (Heavenly Stem Combinations)
export const CHUNGAN_HAP: { pair: [string, string]; element: string }[] = [
  { pair: ["갑", "기"], element: "토" },
  { pair: ["을", "경"], element: "금" },
  { pair: ["병", "신"], element: "수" },
  { pair: ["정", "임"], element: "목" },
  { pair: ["무", "계"], element: "화" },
];

// 천간충 (Heavenly Stem Clash)
export const CHUNGAN_CHUNG: [string, string][] = [
  ["갑", "경"],
  ["을", "신"],
  ["병", "임"],
  ["정", "계"],
];
