import type { FiveElement } from "./types";

export const STEM_HANJA: Record<string, string> = {
  갑: "甲",
  을: "乙",
  병: "丙",
  정: "丁",
  무: "戊",
  기: "己",
  경: "庚",
  신: "辛",
  임: "壬",
  계: "癸",
};

export const BRANCH_HANJA: Record<string, string> = {
  자: "子",
  축: "丑",
  인: "寅",
  묘: "卯",
  진: "辰",
  사: "巳",
  오: "午",
  미: "未",
  신: "申",
  유: "酉",
  술: "戌",
  해: "亥",
};

export const ELEMENT_META: Record<
  FiveElement,
  { label: string; hanja: string; tone: string; soft: string; ink: string }
> = {
  목: {
    label: "목(木)",
    hanja: "木",
    tone: "#2f6b4f",
    soft: "#d7ebe0",
    ink: "#1f4d38",
  },
  화: {
    label: "화(火)",
    hanja: "火",
    tone: "#b84f3e",
    soft: "#f7ddd4",
    ink: "#8a2f1c",
  },
  토: {
    label: "토(土)",
    hanja: "土",
    tone: "#8a6a3d",
    soft: "#f0e6d4",
    ink: "#5c4524",
  },
  금: {
    label: "금(金)",
    hanja: "金",
    tone: "#5a6b7a",
    soft: "#e2e8ee",
    ink: "#334155",
  },
  수: {
    label: "수(水)",
    hanja: "水",
    tone: "#2f5f8a",
    soft: "#d7e6f4",
    ink: "#1e3a5f",
  },
};

export const DAY_MASTER_READING: Record<
  string,
  {
    title: string;
    nature: string;
    traits: string[];
    strengths: string[];
    cautions: string[];
  }
> = {
  갑: {
    title: "큰 나무의 기운",
    nature: "곧게 뻗는 생명력과 방향성이 강한 일간입니다.",
    traits: [
      "원칙을 중시하고 리더십을 발휘하려는 성향이 있습니다.",
      "시작과 개척에 강하고, 목표를 세우면 밀어붙입니다.",
      "겉은 단호해 보여도 내면에는 따뜻한 보호 본능이 있습니다.",
    ],
    strengths: ["결단력", "추진력", "책임감"],
    cautions: ["고집이 과해지면 융통성이 줄 수 있습니다."],
  },
  을: {
    title: "덩굴과 풀의 기운",
    nature: "유연하게 적응하며 관계를 키워가는 일간입니다.",
    traits: [
      "섬세한 감각과 배려심으로 사람을 끌어모읍니다.",
      "환경에 맞춰 성장하는 탄력성이 뛰어납니다.",
      "직접 맞서기보다 우회하며 목적을 이룹니다.",
    ],
    strengths: ["적응력", "공감력", "끈기"],
    cautions: ["결정을 미루면 기회가 흘러갈 수 있습니다."],
  },
  병: {
    title: "태양의 기운",
    nature: "밝게 비추고 주변을 활기차게 만드는 일간입니다.",
    traits: [
      "표현력이 풍부하고 존재감이 뚜렷합니다.",
      "열정적으로 사람을 이끌며 분위기를 만듭니다.",
      "정의감이 강해 불의를 그냥 넘기기 어렵습니다.",
    ],
    strengths: ["카리스마", "낙관성", "추진력"],
    cautions: ["과한 자신감이 주변을 지치게 할 수 있습니다."],
  },
  정: {
    title: "촛불과 노을의 기운",
    nature: "섬세한 열기로 분위기와 감정을 다루는 일간입니다.",
    traits: [
      "미적 감각과 직관이 뛰어나 취향이 분명합니다.",
      "조용히 영향력을 발휘하며 신뢰를 쌓습니다.",
      "관계에서 진심과 예의를 중요하게 여깁니다.",
    ],
    strengths: ["감수성", "집중력", "세련미"],
    cautions: ["감정을 오래 품으면 피로가 쌓일 수 있습니다."],
  },
  무: {
    title: "큰 산의 기운",
    nature: "묵직하게 중심을 잡아주는 일간입니다.",
    traits: [
      "신뢰와 안정감을 주는 존재로 인식됩니다.",
      "큰 그림을 보고 조직을 받치는 힘이 있습니다.",
      "겉으로는 담담해도 속은 든든한 포용력이 있습니다.",
    ],
    strengths: ["안정감", "포용력", "인내"],
    cautions: ["변화를 너무 늦추면 기회가 정체될 수 있습니다."],
  },
  기: {
    title: "밭과 땅의 기운",
    nature: "현실적으로 가꾸고 돌보는 일간입니다.",
    traits: [
      "실무 감각이 뛰어나고 세심한 관리에 강합니다.",
      "사람을 챙기고 일상을 정돈하는 데 재능이 있습니다.",
      "겉은 온화하지만 속으로는 계산이 분명합니다.",
    ],
    strengths: ["현실감각", "배려", "지속력"],
    cautions: ["과도한 걱정이 행동을 묶을 수 있습니다."],
  },
  경: {
    title: "바위와 쇠의 기운",
    nature: "명확하게 가르고 실행하는 일간입니다.",
    traits: [
      "옳고 그름을 분명히 하고 결단이 빠른 편입니다.",
      "도전과 승부 상황에서 힘이 살아납니다.",
      "말보다 결과로 증명하려는 성향이 있습니다.",
    ],
    strengths: ["결단력", "정의감", "실행력"],
    cautions: ["날카로움이 관계의 온도를 낮출 수 있습니다."],
  },
  신: {
    title: "보석과 금속의 기운",
    nature: "예리한 감각으로 완성도를 높이는 일간입니다.",
    traits: [
      "디테일과 품질에 민감하며 취향이 고급스럽습니다.",
      "분석력이 좋아 복잡한 상황을 정리합니다.",
      "겉은 차분해 보여도 내면의 자존심이 강합니다.",
    ],
    strengths: ["분석력", "세련미", "집중력"],
    cautions: ["완벽주의가 스스로를 압박할 수 있습니다."],
  },
  임: {
    title: "큰 강의 기운",
    nature: "넓게 흐르며 지혜를 모으는 일간입니다.",
    traits: [
      "시야가 넓고 포용력이 있어 사람을 모읍니다.",
      "지략과 말솜씨로 흐름을 바꾸는 힘이 있습니다.",
      "자유로운 사고를 좋아하고 틀에 묶이는 것을 싫어합니다.",
    ],
    strengths: ["지혜", "포용력", "순발력"],
    cautions: ["방향이 흩어지면 성과가 흐려질 수 있습니다."],
  },
  계: {
    title: "비와 이슬의 기운",
    nature: "조용히 스며들어 본질을 읽는 일간입니다.",
    traits: [
      "직관과 통찰이 뛰어나 숨은 맥락을 잘 봅니다.",
      "섬세하고 사려 깊어 신뢰를 줍니다.",
      "겉으로는 부드럽지만 속으로는 단단한 기준이 있습니다.",
    ],
    strengths: ["직관", "섬세함", "학습력"],
    cautions: ["생각이 많아지면 실행이 늦어질 수 있습니다."],
  },
};

export const TEN_GOD_HINT: Record<string, string> = {
  비견: "나와 같은 기운 — 자주성, 경쟁, 동료",
  겁재: "강한 동료 기운 — 추진과 쟁투",
  식신: "표현과 재능 — 안정적 창작·생활력",
  상관: "자유로운 표현 — 개혁과 반골",
  편재: "넓은 재물·활동 — 기회 포착",
  정재: "알뜰한 재물 — 성실과 안정",
  편관: "강한 규율·압박 — 도전과 책임",
  정관: "질서와 명예 — 신뢰와 직분",
  편인: "특별한 학문·직관 — 독창적 사고",
  정인: "보호와 학습 — 학문·문서·인덕",
  일간: "나의 중심 기운",
};

export function elementBalanceHint(counts: Record<FiveElement, number>): string[] {
  const entries = (Object.entries(counts) as [FiveElement, number][]).sort(
    (a, b) => b[1] - a[1],
  );
  const strongest = entries[0];
  const weakest = entries[entries.length - 1];
  const hints: string[] = [];

  if (strongest[1] >= 3) {
    hints.push(
      `${strongest[0]} 기운이 두드러집니다. 그 장점을 쓰되, 반대 기운으로 균형을 맞추면 흐름이 부드러워집니다.`,
    );
  } else {
    hints.push("오행이 비교적 고르게 퍼져 있어 상황에 맞춰 기운을 쓰기 좋은 편입니다.");
  }

  if (weakest[1] === 0) {
    hints.push(
      `${weakest[0]} 기운이 비어 있습니다. 생활·직업·관계에서 그 속성을 의도적으로 보완해 보세요.`,
    );
  } else if (weakest[1] === 1 && strongest[1] - weakest[1] >= 2) {
    hints.push(
      `${weakest[0]}이 상대적으로 약합니다. 부족한 오행을 보완하는 환경이 도움이 됩니다.`,
    );
  }

  return hints;
}
