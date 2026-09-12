import type { BranchRelationType, ElementRelationType, FiveElement } from "./types";

export const ELEMENT_GENERATES: Record<FiveElement, FiveElement> = {
  목: "화",
  화: "토",
  토: "금",
  금: "수",
  수: "목",
};

function buildPairMap(pairs: [string, string][]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const [a, b] of pairs) {
    map[a] = b;
    map[b] = a;
  }
  return map;
}

// 육합(六合) — 지지가 짝을 이루어 조화를 이루는 관계
export const BRANCH_SIX_HARMONY = buildPairMap([
  ["자", "축"],
  ["인", "해"],
  ["묘", "술"],
  ["진", "유"],
  ["사", "신"],
  ["오", "미"],
]);

// 삼합(三合) — 세 지지가 하나의 기운으로 뭉치는 그룹
export const BRANCH_TRINE_GROUPS: string[][] = [
  ["해", "묘", "미"],
  ["인", "오", "술"],
  ["사", "유", "축"],
  ["신", "자", "진"],
];

// 충(沖) — 정반대 기운이 부딪히는 관계
export const BRANCH_CLASH = buildPairMap([
  ["자", "오"],
  ["축", "미"],
  ["인", "신"],
  ["묘", "유"],
  ["진", "술"],
  ["사", "해"],
]);

// 원진(怨嗔) — 미묘하게 어긋나 서운함이 쌓이기 쉬운 관계
export const BRANCH_RESENTMENT = buildPairMap([
  ["자", "미"],
  ["축", "오"],
  ["인", "유"],
  ["묘", "신"],
  ["진", "해"],
  ["사", "술"],
]);

export const ELEMENT_RELATION_TEXT: Record<
  ElementRelationType,
  { label: string; description: string }
> = {
  상생: {
    label: "상생(相生)",
    description: "두 일간이 서로 기운을 낳아주는 관계라, 함께 있을수록 자연스럽게 힘이 됩니다.",
  },
  비화: {
    label: "비화(比和)",
    description: "같은 기운이라 마음이 잘 통하고 편안하지만, 서로 다른 자극이 부족할 수 있습니다.",
  },
  상극: {
    label: "상극(相剋)",
    description: "서로를 억누르는 기운이라 부딪힐 때가 있지만, 배려하면 오히려 서로를 다듬어줍니다.",
  },
};

export const BRANCH_RELATION_TEXT: Record<
  BranchRelationType,
  { label: string; description: string }
> = {
  육합: {
    label: "육합(六合)",
    description: "짝을 이루어 하나로 합쳐지는 관계로, 손발이 잘 맞고 정이 깊어지기 쉽습니다.",
  },
  삼합: {
    label: "삼합(三合)",
    description: "같은 기운으로 뭉치는 관계로, 목표를 함께 세우면 시너지가 큽니다.",
  },
  평범: {
    label: "평기(平氣)",
    description: "특별히 합이나 충이 없는 무난한 관계로, 함께 만들어가는 노력이 관계를 좌우합니다.",
  },
  원진: {
    label: "원진(怨嗔)",
    description: "사소한 일에도 서운함이 쌓이기 쉬운 관계라, 감정을 자주 확인하는 대화가 필요합니다.",
  },
  충: {
    label: "충(沖)",
    description: "정반대 기운이 부딪히는 관계라 의견 차이가 크지만, 그만큼 서로를 자극하며 성장할 수 있습니다.",
  },
};
