import type { FiveElement } from "./types";

export type FortuneTone = "great" | "good" | "fair" | "caution";

export type FortuneLevel = "대길" | "길" | "평" | "소평" | "주의";

export interface DailyCategory {
  key: "love" | "money" | "work" | "health";
  title: string;
  score: number;
  tone: FortuneTone;
  level: FortuneLevel;
  summary: string;
}

export interface DailyFortune {
  name: string;
  dateText: string;
  weekday: string;
  dayMaster: string;
  dayMasterHanja: string;
  dayMasterElement: FiveElement;
  todayPillar: string;
  todayPillarHanja: string;
  todayStem: string;
  todayBranch: string;
  todayStemHanja: string;
  todayBranchHanja: string;
  stemElement: FiveElement;
  branchElement: FiveElement;
  stemGod: string;
  branchGod: string;
  overallScore: number;
  tone: FortuneTone;
  level: FortuneLevel;
  headline: string;
  categories: DailyCategory[];
  luckyColor: string;
  luckyDirection: string;
  luckyItem: string;
  luckyNumber: number;
  advice: string[];
  elementLabel: string;
}
