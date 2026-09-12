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

export type ElementRelationType = "상생" | "비화" | "상극";

export type BranchRelationType = "육합" | "삼합" | "충" | "원진" | "평범";

export interface RelationDetail<T extends string> {
  type: T;
  label: string;
  description: string;
}

export interface CompatibilityPerson {
  dayMaster: string;
  dayMasterElement: FiveElement;
  dayBranch: string;
  yearBranch: string;
}

export interface CompatibilityAnalysis {
  score: number;
  tier: string;
  headline: string;
  personA: CompatibilityPerson;
  personB: CompatibilityPerson;
  dayMasterRelation: RelationDetail<ElementRelationType>;
  dayBranchRelation: RelationDetail<BranchRelationType>;
  yearBranchRelation: RelationDetail<BranchRelationType>;
  elementNote: string;
  strengths: string[];
  cautions: string[];
}
