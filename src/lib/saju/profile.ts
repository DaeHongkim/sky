import type { FiveElement } from "./types";

/** 원국 고정 프로필 — 일간 庚金, 火·土 공백 */
export const OWNER_PROFILE = {
  dayMaster: "경" as const,
  dayMasterHanja: "庚",
  dayMasterElement: "금" as FiveElement,
  missingElements: ["화", "토"] as FiveElement[],
  fillPriority: ["화", "토"] as FiveElement[],
  spouse: {
    summary:
      "배우자운은 일진과 무관하게 원국·대운의 평생운으로만 봅니다. 火土를 채워 주는 상대가 최적입니다.",
    idealDayStems: ["병", "정"] as const,
    idealDayBranches: ["사", "오", "미", "술"] as const,
    idealLabel: "일간 丙·丁火, 또는 일지 巳·午·未·戌을 가진 여성",
    marriageYear: 2027,
    marriagePillar: "정미",
    marriageHanja: "丁未",
    marriageNote: "결혼 적기는 2027년 丁未년으로 고정합니다.",
  },
  colorFill: {
    prefer: ["빨강", "주황", "노랑", "황토색"],
    preferDirections: ["남쪽"],
    avoidWhenWaterWoodHeavy: ["검정", "초록"],
  },
} as const;

export type FortuneCategory =
  | "business"
  | "relations"
  | "sns"
  | "judgment"
  | "condition"
  | "romance";

export const CATEGORY_LABELS: Record<FortuneCategory, string> = {
  business: "사업",
  relations: "대인",
  sns: "SNS",
  judgment: "판단력",
  condition: "컨디션",
  romance: "이성운",
};
