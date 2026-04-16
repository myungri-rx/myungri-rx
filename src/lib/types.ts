export type Gender = "male" | "female";
export type CalendarType = "solar" | "lunar";
export type DayMasterStrength = "strong" | "weak" | "neutral";

export interface SajuInput {
  name: string;
  gender: Gender;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:mm or '모름'
  calendarType: CalendarType;
  isLeapMonth?: boolean;
}

export interface Pillar {
  stem: string; // 한글 천간 e.g. "갑"
  branch: string; // 한글 지지 e.g. "자"
}

export interface PillarHanja {
  stem: string; // 한자 천간 e.g. "甲"
  branch: string; // 한자 지지 e.g. "子"
}

export interface FourPillars {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour?: Pillar; // undefined when birth time unknown
}

export interface FourPillarsHanja {
  year: PillarHanja;
  month: PillarHanja;
  day: PillarHanja;
  hour?: PillarHanja;
}

export interface FiveElements {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
}

export interface TenGods {
  yearStem: string;
  yearBranch: string;
  monthStem: string;
  monthBranch: string;
  dayStem: string; // always "비견"
  dayBranch: string;
  hourStem?: string;
  hourBranch?: string;
}

export interface BranchRelations {
  samhap: string[]; // e.g. ["인오술 화국"]
  yukhap: string[]; // e.g. ["자축합"]
  chung: string[]; // e.g. ["자오충"]
  hyung: string[]; // e.g. ["인사형"]
  hae: string[]; // e.g. ["자미해"]
  banghap: string[];
}

export interface HiddenStems {
  year: string[];
  month: string[];
  day: string[];
  hour?: string[];
}

export interface TwelveStages {
  year: string;
  month: string;
  day: string;
  hour?: string;
}

export interface DaeunInfo {
  stem: string;
  branch: string;
  stemHanja: string;
  branchHanja: string;
  startAge: number;
  endAge: number;
  tenGod: string;
}

export interface SeunInfo {
  year: number;
  stem: string;
  branch: string;
  stemHanja: string;
  branchHanja: string;
  tenGod: string;
}

export interface SajuAnalysisData {
  input: SajuInput;
  zodiacAnimal: string; // 띠 e.g. "닭"
  fourPillars: FourPillars;
  fourPillarsHanja: FourPillarsHanja;
  fiveElements: FiveElements;
  dominantElement: string;
  weakestElement: string;
  tenGods: TenGods;
  branchRelations: BranchRelations;
  hiddenStems: HiddenStems;
  twelveStages: TwelveStages;
  spirits: string[];
  emptiness: string[];
  daeunList: DaeunInfo[];
  currentDaeun: DaeunInfo;
  currentSeun: SeunInfo;
  nextSeun: SeunInfo;
  dayMasterStrength: DayMasterStrength;
  yongShin: string;
  huiShin: string;
  giShin: string;
}

export interface AnalysisRequest {
  sajuData: SajuAnalysisData;
  concern?: string;
}

export interface CompatibilityRequest {
  person1: SajuAnalysisData;
  person2: SajuAnalysisData;
}

export type OhaengKey = "wood" | "fire" | "earth" | "metal" | "water";

export type AnalysisMode = "teaser" | "full";
export type AnalysisPhase = "idle" | "teaser-streaming" | "teaser-done" | "full-streaming" | "full-done";
