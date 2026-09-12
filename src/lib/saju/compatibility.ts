import { analyzeSaju } from "./analyze";
import {
  BRANCH_CLASH,
  BRANCH_RELATION_TEXT,
  BRANCH_RESENTMENT,
  BRANCH_SIX_HARMONY,
  BRANCH_TRINE_GROUPS,
  ELEMENT_GENERATES,
  ELEMENT_RELATION_TEXT,
} from "./compatibilityData";
import type {
  BirthInput,
  BranchRelationType,
  CompatibilityAnalysis,
  CompatibilityPerson,
  ElementCount,
  ElementRelationType,
  FiveElement,
  RelationDetail,
} from "./types";

const DAY_MASTER_SCORE: Record<ElementRelationType, number> = {
  상생: 35,
  비화: 24,
  상극: 14,
};

const DAY_BRANCH_SCORE: Record<BranchRelationType, number> = {
  육합: 35,
  삼합: 30,
  평범: 20,
  원진: 10,
  충: 5,
};

const YEAR_BRANCH_SCORE: Record<BranchRelationType, number> = {
  육합: 15,
  삼합: 13,
  평범: 9,
  원진: 5,
  충: 2,
};

function elementRelationType(a: FiveElement, b: FiveElement): ElementRelationType {
  if (a === b) return "비화";
  if (ELEMENT_GENERATES[a] === b || ELEMENT_GENERATES[b] === a) return "상생";
  return "상극";
}

function branchRelationType(a: string, b: string): BranchRelationType {
  if (a === b) return "평범";
  if (BRANCH_SIX_HARMONY[a] === b) return "육합";
  if (BRANCH_TRINE_GROUPS.some((group) => group.includes(a) && group.includes(b))) {
    return "삼합";
  }
  if (BRANCH_CLASH[a] === b) return "충";
  if (BRANCH_RESENTMENT[a] === b) return "원진";
  return "평범";
}

function toRelationDetail<T extends string>(
  type: T,
  text: Record<T, { label: string; description: string }>,
): RelationDetail<T> {
  return { type, ...text[type] };
}

function elementComplementScore(a: ElementCount[], b: ElementCount[]): number {
  let matches = 0;
  for (const entry of a) {
    const other = b.find((e) => e.element === entry.element);
    if (!other) continue;
    const aWeak = entry.ratio < 0.12;
    const aStrong = entry.ratio > 0.28;
    const bWeak = other.ratio < 0.12;
    const bStrong = other.ratio > 0.28;
    if ((aWeak && bStrong) || (aStrong && bWeak)) matches += 1;
  }
  return Math.min(15, 6 + matches * 3);
}

function tierFor(score: number): { tier: string; headline: string } {
  if (score >= 85) {
    return {
      tier: "천생연분",
      headline: "일간과 배우자궁이 두루 조화를 이루는, 보기 드물게 좋은 궁합입니다.",
    };
  }
  if (score >= 70) {
    return {
      tier: "좋은 인연",
      headline: "서로를 자연스럽게 끌어주는 힘이 많아, 함께할수록 관계가 단단해질 궁합입니다.",
    };
  }
  if (score >= 55) {
    return {
      tier: "무난한 인연",
      headline: "특별히 부딪힐 요소는 적지만, 마음을 쏟는 만큼 좋아지는 궁합입니다.",
    };
  }
  if (score >= 40) {
    return {
      tier: "신중한 접근",
      headline: "서로 다른 기운이 강해 이해가 필요하지만, 그 차이가 자극이 될 수도 있습니다.",
    };
  }
  return {
    tier: "노력이 필요한 인연",
    headline: "기운이 부딪히는 지점이 많아, 대화와 배려를 더 자주 쌓아가야 하는 궁합입니다.",
  };
}

function toPerson(input: BirthInput): {
  person: CompatibilityPerson;
  elements: ElementCount[];
} {
  const analysis = analyzeSaju(input);
  const yearBranch = analysis.pillars[0].branch;
  const dayBranch = analysis.pillars[2].branch;
  return {
    person: {
      dayMaster: analysis.dayMaster,
      dayMasterElement: analysis.dayMasterElement,
      dayBranch,
      yearBranch,
    },
    elements: analysis.elements,
  };
}

export function analyzeCompatibility(
  inputA: BirthInput,
  inputB: BirthInput,
): CompatibilityAnalysis {
  const a = toPerson(inputA);
  const b = toPerson(inputB);

  const dayMasterType = elementRelationType(a.person.dayMasterElement, b.person.dayMasterElement);
  const dayBranchType = branchRelationType(a.person.dayBranch, b.person.dayBranch);
  const yearBranchType = branchRelationType(a.person.yearBranch, b.person.yearBranch);

  const elementScore = elementComplementScore(a.elements, b.elements);
  const score =
    DAY_MASTER_SCORE[dayMasterType] +
    DAY_BRANCH_SCORE[dayBranchType] +
    YEAR_BRANCH_SCORE[yearBranchType] +
    elementScore;

  const { tier, headline } = tierFor(score);

  const strengths: string[] = [];
  const cautions: string[] = [];

  if (dayMasterType === "상생") {
    strengths.push("두 사람의 일간이 상생하여, 서로의 기운을 자연스럽게 북돋아 줍니다.");
  } else if (dayMasterType === "비화") {
    strengths.push("일간의 기운이 같아 취향과 속도가 비슷해 편안함을 느낍니다.");
  } else {
    cautions.push("일간이 상극 관계라 의견이 부딪힐 때가 있으니, 한 박자 쉬고 대화하면 좋습니다.");
  }

  if (dayBranchType === "육합" || dayBranchType === "삼합") {
    strengths.push("배우자궁(일지)이 합을 이루어, 부부로서의 결속이 특히 단단한 편입니다.");
  } else if (dayBranchType === "충" || dayBranchType === "원진") {
    cautions.push("배우자궁(일지)이 부딪히는 관계라, 생활 습관을 맞추는 데 시간이 걸릴 수 있습니다.");
  }

  if (yearBranchType === "충" || yearBranchType === "원진") {
    cautions.push("띠(년지)가 부딪히는 관계라 집안·가치관 차이를 조율하는 대화가 도움이 됩니다.");
  } else if (yearBranchType === "육합" || yearBranchType === "삼합") {
    strengths.push("띠(년지)끼리 합을 이루어, 서로의 배경을 이해하는 데 유리합니다.");
  }

  const elementNote =
    elementScore >= 12
      ? "한쪽이 강한 오행을 다른 한쪽이 채워주는 구조라, 서로의 부족한 기운을 자연스럽게 메워줍니다."
      : "오행 분포가 비슷한 편이라 큰 보완 효과보다는 취향이 잘 맞는 쪽에 가깝습니다.";

  if (strengths.length === 0) {
    strengths.push("아직 뚜렷한 합은 없지만, 함께 쌓아가는 시간이 관계의 바탕이 될 수 있습니다.");
  }
  if (cautions.length === 0) {
    cautions.push("특별히 부딪히는 기운은 없으니, 지금의 좋은 흐름을 꾸준히 이어가면 됩니다.");
  }

  return {
    score: Math.round(score),
    tier,
    headline,
    personA: a.person,
    personB: b.person,
    dayMasterRelation: toRelationDetail(dayMasterType, ELEMENT_RELATION_TEXT),
    dayBranchRelation: toRelationDetail(dayBranchType, BRANCH_RELATION_TEXT),
    yearBranchRelation: toRelationDetail(yearBranchType, BRANCH_RELATION_TEXT),
    elementNote,
    strengths,
    cautions,
  };
}
