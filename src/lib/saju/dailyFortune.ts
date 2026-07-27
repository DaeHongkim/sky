import {
  calculateFourPillars,
  getBranchTenGod,
  getEarthlyBranchElement,
  getHeavenlyStemElement,
  getTenGod,
} from "manseryeok";
import { ELEMENT_META, STEM_HANJA, BRANCH_HANJA } from "./dayMaster";
import type { BirthInput, FiveElement } from "./types";
import type {
  DailyCategory,
  DailyFortune,
  FortuneLevel,
  FortuneTone,
} from "./dailyTypes";

const ELEMENTS: FiveElement[] = ["목", "화", "토", "금", "수"];

/** 십신별 기본 운세 점수 (40–95) */
const TEN_GOD_SCORE: Record<string, number> = {
  비견: 62,
  겁재: 55,
  식신: 82,
  상관: 68,
  편재: 78,
  정재: 84,
  편관: 52,
  정관: 72,
  편인: 70,
  정인: 80,
  일간: 65,
};

const TEN_GOD_OVERALL: Record<string, string> = {
  비견: "나와 같은 기운이 강해, 스스로 중심을 잡고 나아가기 좋은 날입니다.",
  겁재: "경쟁과 움직임이 커질 수 있어요. 힘을 나누되 방향을 놓치지 마세요.",
  식신: "재능과 표현이 잘 통하는 날입니다. 만들고 말하는 일이 빛을 봅니다.",
  상관: "틀을 깨는 아이디어가 떠오르기 쉽습니다. 날카로움은 부드럽게 쓰세요.",
  편재: "넓은 기회가 스치는 날입니다. 움직임 속에서 수익의 실마리를 잡으세요.",
  정재: "차곡차곡 쌓는 실속이 따르는 날입니다. 계획한 일을 마무리하기 좋습니다.",
  편관: "압박과 책임이 느껴질 수 있습니다. 한 걸음씩 정리하며 대응하세요.",
  정관: "질서와 신뢰가 도움이 됩니다. 공식적인 일·약속에 힘을 실어보세요.",
  편인: "직관과 특별한 공부가 열리는 날입니다. 평소와 다른 관점을 환영하세요.",
  정인: "배움과 보호의 기운이 감쌉니다. 문서·상담·휴식이 약이 됩니다.",
};

const CATEGORY_BY_GOD: Record<
  string,
  { love: number; money: number; work: number; health: number }
> = {
  비견: { love: 58, money: 55, work: 70, health: 68 },
  겁재: { love: 52, money: 48, work: 66, health: 60 },
  식신: { love: 72, money: 70, work: 78, health: 80 },
  상관: { love: 64, money: 58, work: 74, health: 62 },
  편재: { love: 68, money: 86, work: 72, health: 64 },
  정재: { love: 74, money: 88, work: 76, health: 70 },
  편관: { love: 48, money: 54, work: 62, health: 55 },
  정관: { love: 66, money: 68, work: 84, health: 72 },
  편인: { love: 60, money: 58, work: 70, health: 74 },
  정인: { love: 70, money: 64, work: 76, health: 86 },
};

const CATEGORY_COPY: Record<
  DailyCategory["key"],
  { title: string; lines: Record<FortuneTone, string> }
> = {
  love: {
    title: "애정·관계",
    lines: {
      great: "마음이 열리는 대화가 이어집니다. 진심을 전하기 좋은 타이밍입니다.",
      good: "관계의 온도가 부드럽게 오릅니다. 작은 배려가 큰 울림을 줍니다.",
      fair: "감정 기복이 있을 수 있어요. 듣기를 먼저 하면 흐름이 풀립니다.",
      caution: "오해가 생기기 쉽습니다. 말보다 침묵이 약이 되는 순간이 있습니다.",
    },
  },
  money: {
    title: "재물·기회",
    lines: {
      great: "돈이 움직이는 길이 보입니다. 준비해 둔 계획이 결실을 맺기 쉽습니다.",
      good: "실속 있는 수입·절약이 함께합니다. 작은 지출도 기록해 두세요.",
      fair: "큰 승부보다는 현상 유지가 낫습니다. 충동구매는 하루만 미뤄보세요.",
      caution: "손실·누수가 보일 수 있습니다. 계약·보증은 오늘을 피하세요.",
    },
  },
  work: {
    title: "일·성취",
    lines: {
      great: "집중력이 살아나는 날입니다. 미뤄 둔 핵심 과제를 밀어붙이세요.",
      good: "협업과 피드백이 잘 통합니다. 제안서를 꺼내 보기 좋은 때입니다.",
      fair: "속도보다 정확도가 중요합니다. 체크리스트로 실수를 줄이세요.",
      caution: "일정 충돌·압박이 커질 수 있습니다. 우선순위만 지키면 됩니다.",
    },
  },
  health: {
    title: "건강·컨디션",
    lines: {
      great: "기운이 맑게 순환합니다. 가벼운 산책이나 스트레칭이 특히 잘 맞습니다.",
      good: "무난한 컨디션입니다. 수분과 규칙적인 식사로 리듬을 유지하세요.",
      fair: "피로가 쌓이기 쉽습니다. 낮잠·휴식 시간을 짧게라도 확보하세요.",
      caution: "과로·과식을 경계하세요. 목·어깨·소화기를 부드럽게 풀어 주세요.",
    },
  },
};

const LUCKY_BY_ELEMENT: Record<
  FiveElement,
  { color: string; direction: string; item: string; number: number }
> = {
  목: { color: "청록·연두", direction: "동쪽", item: "나무·식물", number: 3 },
  화: { color: "주홍·살구", direction: "남쪽", item: "촛불·따뜻한 차", number: 9 },
  토: { color: "황토·베이지", direction: "중앙·남서", item: "도자기·흙손", number: 5 },
  금: { color: "은빛·흰 회색", direction: "서쪽", item: "금속·열쇠", number: 7 },
  수: { color: "남색·먹색", direction: "북쪽", item: "물·노트", number: 1 },
};

const ADVICE_BY_TONE: Record<FortuneTone, string[]> = {
  great: [
    "흐름이 당신 편입니다. 미뤄 둔 첫걸음을 오늘 떼어 보세요.",
    "감사의 말을 전하면 운이 한 겹 더 두터워집니다.",
  ],
  good: [
    "무리하지 않는 선에서 계획을 실행에 옮기세요.",
    "가까운 사람과의 짧은 연락이 좋은 기운을 불러옵니다.",
  ],
  fair: [
    "속도를 낮추고 기본기를 다지는 하루로 삼으세요.",
    "새로운 약속보다 이미 열린 문을 정리하는 편이 낫습니다.",
  ],
  caution: [
    "큰 결정보다 관찰과 정리가 우선입니다.",
    "몸과 마음에 여유를 주면 내일의 운이 살아납니다.",
  ],
};

function asElement(value: string): FiveElement {
  if (ELEMENTS.includes(value as FiveElement)) return value as FiveElement;
  return "토";
}

function scoreToTone(score: number): FortuneTone {
  if (score >= 80) return "great";
  if (score >= 68) return "good";
  if (score >= 55) return "fair";
  return "caution";
}

function scoreToLevel(score: number): FortuneLevel {
  if (score >= 85) return "대길";
  if (score >= 75) return "길";
  if (score >= 65) return "평";
  if (score >= 55) return "소평";
  return "주의";
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function weekdayKo(date: Date): string {
  return ["일", "월", "화", "수", "목", "금", "토"][date.getDay()] ?? "";
}

function formatDateKo(date: Date): string {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

/** Asia/Seoul 기준의 ‘오늘’ 날짜 (로컬 Date, 연·월·일만 사용) */
export function todayInKorea(now: Date = new Date()): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);
  return new Date(year, month - 1, day);
}

/** 생년월일·성별과 조회일로 오늘의 운세를 계산합니다. */
export function analyzeDailyFortune(
  birth: BirthInput,
  date: Date = todayInKorea(),
): DailyFortune {
  const hour = birth.hour ?? 12;
  const minute = birth.hour === null ? 0 : birth.minute;

  const natal = calculateFourPillars({
    year: birth.year,
    month: birth.month,
    day: birth.day,
    hour,
    minute,
    gender: birth.gender,
    isLunar: birth.isLunar,
    isLeapMonth: birth.isLeapMonth,
  });

  const dayMaster = natal.day.heavenlyStem;
  const dayMasterElement = asElement(natal.dayElement.stem);

  const today = calculateFourPillars({
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hour: 12,
    minute: 0,
  });

  const todayStem = today.day.heavenlyStem;
  const todayBranch = today.day.earthlyBranch;
  const stemGod = getTenGod(dayMaster, todayStem);
  const branchGod = getBranchTenGod(dayMaster, todayBranch);
  const stemElement = asElement(getHeavenlyStemElement(todayStem));
  const branchElement = asElement(getEarthlyBranchElement(todayBranch));

  const stemScore = TEN_GOD_SCORE[stemGod] ?? 65;
  const branchScore = TEN_GOD_SCORE[branchGod] ?? 65;
  // 일진 천간 비중을 조금 더 둡니다.
  const overallScore = clamp(stemScore * 0.58 + branchScore * 0.42, 42, 96);
  const tone = scoreToTone(overallScore);
  const level = scoreToLevel(overallScore);

  const stemCat = CATEGORY_BY_GOD[stemGod] ?? CATEGORY_BY_GOD.비견;
  const branchCat = CATEGORY_BY_GOD[branchGod] ?? CATEGORY_BY_GOD.비견;

  const categoryKeys = ["love", "money", "work", "health"] as const;
  const categories: DailyCategory[] = categoryKeys.map((key) => {
    const score = clamp(stemCat[key] * 0.55 + branchCat[key] * 0.45, 40, 95);
    const catTone = scoreToTone(score);
    return {
      key,
      title: CATEGORY_COPY[key].title,
      score,
      tone: catTone,
      level: scoreToLevel(score),
      summary: CATEGORY_COPY[key].lines[catTone],
    };
  });

  // 부족한 오행을 보완하는 쪽을 길신으로 둡니다.
  const produceMap: Record<FiveElement, FiveElement> = {
    목: "수",
    화: "목",
    토: "화",
    금: "토",
    수: "금",
  };
  const luckyElement = produceMap[dayMasterElement];
  const lucky = LUCKY_BY_ELEMENT[luckyElement];

  const name = birth.name.trim() || "이름 미상";
  const headline = TEN_GOD_OVERALL[stemGod] ?? TEN_GOD_OVERALL.비견;
  const advice = [
    ...ADVICE_BY_TONE[tone],
    `오늘 일진은 ${today.dayString}(${today.dayHanja}) · 십신 ${stemGod}·${branchGod}입니다.`,
  ];

  return {
    name,
    dateText: formatDateKo(date),
    weekday: weekdayKo(date),
    dayMaster,
    dayMasterHanja: STEM_HANJA[dayMaster] ?? dayMaster,
    dayMasterElement,
    todayPillar: today.dayString,
    todayPillarHanja: today.dayHanja,
    todayStem,
    todayBranch,
    todayStemHanja: STEM_HANJA[todayStem] ?? todayStem,
    todayBranchHanja: BRANCH_HANJA[todayBranch] ?? todayBranch,
    stemElement,
    branchElement,
    stemGod,
    branchGod,
    overallScore,
    tone,
    level,
    headline,
    categories,
    luckyColor: lucky.color,
    luckyDirection: lucky.direction,
    luckyItem: lucky.item,
    luckyNumber: lucky.number,
    advice,
    elementLabel: ELEMENT_META[dayMasterElement].label,
  };
}
