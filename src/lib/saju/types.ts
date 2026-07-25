export type Gender = "male" | "female";

export type FiveElement = "목" | "화" | "토" | "금" | "수";

export interface BirthInput {
  name: string;
  year: number;
  month: number;
  day: number;
  hour: number | null;
  minute: number;
  gender: Gender;
  isLunar: boolean;
  isLeapMonth: boolean;
}

export interface PillarView {
  label: string;
  stem: string;
  branch: string;
  hanja: string;
  korean: string;
  stemElement: FiveElement;
  branchElement: FiveElement;
  stemTenGod: string;
  branchTenGod: string;
}

export interface ElementCount {
  element: FiveElement;
  count: number;
  ratio: number;
}

export interface LuckPillarView {
  age: number;
  korean: string;
  stem: string;
  branch: string;
}

/** 만세력 기본 정보 — 이름·생시·건곤명 한 줄 요약 */
export interface ManseryeokBasicInfo {
  name: string;
  /** 예: 基本 1992년 3월 15일 (양력) 15:49 · 乾命(남) */
  headline: string;
  calendarLabel: "양력" | "음력";
  genderLabel: "乾命(남)" | "坤命(여)";
  hourBranchLabel: string;
  timeText: string;
  solarText: string;
  lunarText: string;
  pillarsLine: string;
  pillarsHanja: string;
}

export interface SajuAnalysis {
  basic: ManseryeokBasicInfo;
  pillars: PillarView[];
  dayMaster: string;
  dayMasterHanja: string;
  dayMasterElement: FiveElement;
  elements: ElementCount[];
  voidBranches: string[];
  luckForward: boolean;
  luckStartAge: number;
  luckPillars: LuckPillarView[];
  lunar: {
    year: number;
    month: number;
    day: number;
    isLeapMonth: boolean;
  };
  summary: string;
  personality: string[];
  fortuneHints: string[];
}
