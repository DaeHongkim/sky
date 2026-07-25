export type Gender = "male" | "female";

export type FiveElement = "목" | "화" | "토" | "금" | "수";

export interface BirthInput {
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

export interface SajuAnalysis {
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
