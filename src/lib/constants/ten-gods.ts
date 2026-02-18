// 십신 산출 조견표 (SAJU_REFERENCE.md §4-5)
// Row: 일간 (day stem), Column: 타천간 (other stem)
// Index follows STEMS_HANGUL order: 갑을병정무기경신임계

export const TEN_GODS_TABLE: Record<string, string[]> = {
  갑: ["비견", "겁재", "식신", "상관", "편재", "정재", "편관", "정관", "편인", "정인"],
  을: ["겁재", "비견", "상관", "식신", "정재", "편재", "정관", "편관", "정인", "편인"],
  병: ["편인", "정인", "비견", "겁재", "식신", "상관", "편재", "정재", "편관", "정관"],
  정: ["정인", "편인", "겁재", "비견", "상관", "식신", "정재", "편재", "정관", "편관"],
  무: ["편관", "정관", "편인", "정인", "비견", "겁재", "식신", "상관", "편재", "정재"],
  기: ["정관", "편관", "정인", "편인", "겁재", "비견", "상관", "식신", "정재", "편재"],
  경: ["편재", "정재", "편관", "정관", "편인", "정인", "비견", "겁재", "식신", "상관"],
  신: ["정재", "편재", "정관", "편관", "정인", "편인", "겁재", "비견", "상관", "식신"],
  임: ["식신", "상관", "편재", "정재", "편관", "정관", "편인", "정인", "비견", "겁재"],
  계: ["상관", "식신", "정재", "편재", "정관", "편관", "정인", "편인", "겁재", "비견"],
};

// The same table using hanja keys for convenience
export const TEN_GODS_TABLE_HANJA: Record<string, string[]> = {
  甲: TEN_GODS_TABLE["갑"],
  乙: TEN_GODS_TABLE["을"],
  丙: TEN_GODS_TABLE["병"],
  丁: TEN_GODS_TABLE["정"],
  戊: TEN_GODS_TABLE["무"],
  己: TEN_GODS_TABLE["기"],
  庚: TEN_GODS_TABLE["경"],
  辛: TEN_GODS_TABLE["신"],
  壬: TEN_GODS_TABLE["임"],
  癸: TEN_GODS_TABLE["계"],
};

export type TenGodName =
  | "비견" | "겁재"
  | "식신" | "상관"
  | "편재" | "정재"
  | "편관" | "정관"
  | "편인" | "정인";

// 십신 그룹
export const TEN_GOD_GROUPS: Record<string, TenGodName[]> = {
  비겁: ["비견", "겁재"],
  식상: ["식신", "상관"],
  재성: ["편재", "정재"],
  관성: ["편관", "정관"],
  인성: ["편인", "정인"],
};
