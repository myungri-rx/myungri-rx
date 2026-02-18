// 지장간 조견표 (SAJU_REFERENCE.md §4-7)
// Each branch contains hidden stems: [본기, 중기?, 여기?]

export const HIDDEN_STEMS_TABLE: Record<string, string[]> = {
  자: ["계"],
  축: ["기", "계", "신"],
  인: ["갑", "병", "무"],
  묘: ["을"],
  진: ["무", "을", "계"],
  사: ["병", "경", "무"],
  오: ["정", "기"],
  미: ["기", "정", "을"],
  신: ["경", "임", "무"],
  유: ["신"],
  술: ["무", "신", "정"],
  해: ["임", "갑"],
};

// 지장간 with labels
export interface HiddenStemDetail {
  main: string;     // 본기 (main qi)
  middle?: string;  // 중기 (middle qi)
  residual?: string; // 여기 (residual qi)
}

export const HIDDEN_STEMS_DETAIL: Record<string, HiddenStemDetail> = {
  자: { main: "계" },
  축: { main: "기", middle: "계", residual: "신" },
  인: { main: "갑", middle: "병", residual: "무" },
  묘: { main: "을" },
  진: { main: "무", middle: "을", residual: "계" },
  사: { main: "병", middle: "경", residual: "무" },
  오: { main: "정", middle: "기" },
  미: { main: "기", middle: "정", residual: "을" },
  신: { main: "경", middle: "임", residual: "무" },
  유: { main: "신" },
  술: { main: "무", middle: "신", residual: "정" },
  해: { main: "임", middle: "갑" },
};
