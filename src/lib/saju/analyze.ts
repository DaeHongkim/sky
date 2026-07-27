import { calculateFourPillars, solarToLunar } from "manseryeok";
import {
  DAY_MASTER_READING,
  ELEMENT_META,
  STEM_HANJA,
  TEN_GOD_HINT,
  elementBalanceHint,
} from "./dayMaster";
import type {
  BirthInput,
  ElementCount,
  FiveElement,
  LuckPillarView,
  PillarView,
  SajuAnalysis,
} from "./types";

const ELEMENTS: FiveElement[] = ["목", "화", "토", "금", "수"];

function asElement(value: string): FiveElement {
  if (ELEMENTS.includes(value as FiveElement)) {
    return value as FiveElement;
  }
  return "토";
}

export function analyzeSaju(input: BirthInput): SajuAnalysis {
  const hour = input.hour ?? 12;
  const minute = input.hour === null ? 0 : input.minute;

  const result = calculateFourPillars({
    year: input.year,
    month: input.month,
    day: input.day,
    hour,
    minute,
    gender: input.gender,
    isLunar: input.isLunar,
    isLeapMonth: input.isLeapMonth,
  });

  const labels = ["년주", "월주", "일주", "시주"] as const;
  const keys = ["year", "month", "day", "hour"] as const;

  const pillars: PillarView[] = keys.map((key, index) => {
    const pillar = result[key];
    const element = result[`${key}Element`];
    const tenGod = result.tenGods[key];
    return {
      label: labels[index],
      stem: pillar.heavenlyStem,
      branch: pillar.earthlyBranch,
      hanja: result[`${key}Hanja`],
      korean: result[`${key}String`],
      stemElement: asElement(element.stem),
      branchElement: asElement(element.branch),
      stemTenGod: key === "day" ? "일간" : tenGod.stem,
      branchTenGod: tenGod.branch,
    };
  });

  if (input.hour === null) {
    pillars[3] = {
      ...pillars[3],
      label: "시주",
      stem: "?",
      branch: "?",
      hanja: "未詳",
      korean: "모름",
      stemTenGod: "미상",
      branchTenGod: "미상",
    };
  }

  const counts: Record<FiveElement, number> = {
    목: 0,
    화: 0,
    토: 0,
    금: 0,
    수: 0,
  };

  for (const pillar of pillars) {
    if (pillar.stem !== "?") {
      counts[pillar.stemElement] += 1;
      counts[pillar.branchElement] += 1;
    }
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  const elements: ElementCount[] = ELEMENTS.map((element) => ({
    element,
    count: counts[element],
    ratio: counts[element] / total,
  }));

  const dayMaster = result.day.heavenlyStem;
  const reading = DAY_MASTER_READING[dayMaster];
  const dayMasterElement = asElement(result.dayElement.stem);

  const luckPillars: LuckPillarView[] = (result.luckPillars?.pillars ?? [])
    .slice(0, 8)
    .map((p) => ({
      age: p.age,
      korean: p.korean,
      stem: p.pillar.heavenlyStem,
      branch: p.pillar.earthlyBranch,
    }));

  let lunar = {
    year: input.year,
    month: input.month,
    day: input.day,
    isLeapMonth: false,
  };

  if (!input.isLunar) {
    const converted = solarToLunar(input.year, input.month, input.day);
    lunar = {
      year: converted.year,
      month: converted.month,
      day: converted.day,
      isLeapMonth: converted.isLeapMonth,
    };
  } else {
    lunar = {
      year: input.year,
      month: input.month,
      day: input.day,
      isLeapMonth: input.isLeapMonth,
    };
  }

  const balanceHints = elementBalanceHint(counts);
  const topGods = pillars
    .flatMap((p) => [p.stemTenGod, p.branchTenGod])
    .filter((g) => g !== "일간" && g !== "미상");
  const uniqueGods = [...new Set(topGods)].slice(0, 3);

  const fortuneHints = [
    ...balanceHints,
    ...uniqueGods.map((g) => TEN_GOD_HINT[g] ?? `${g} 기운이 사주에 나타납니다.`),
  ].slice(0, 4);

  const summary = reading
    ? `일간 ${dayMaster}(${ELEMENT_META[dayMasterElement].hanja}) — ${reading.title}. ${reading.nature}`
    : `일간 ${dayMaster}을 중심으로 사주가 구성됩니다.`;

  return {
    pillars,
    dayMaster,
    dayMasterHanja: STEM_HANJA[dayMaster] ?? dayMaster,
    dayMasterElement,
    elements,
    voidBranches: [...(result.voidBranches ?? [])],
    luckForward: Boolean(result.luckPillars?.forward),
    luckStartAge: result.luckPillars?.startAge ?? 0,
    luckPillars,
    lunar,
    summary,
    personality: reading?.traits ?? [],
    fortuneHints,
  };
}

export const HOUR_OPTIONS: { label: string; value: number | null; range: string }[] =
  [
    { label: "시간 모름", value: null, range: "시주 제외" },
    { label: "조자시", value: 0, range: "00:00–00:59" },
    { label: "축시", value: 1, range: "01:00–02:59" },
    { label: "인시", value: 3, range: "03:00–04:59" },
    { label: "묘시", value: 5, range: "05:00–06:59" },
    { label: "진시", value: 7, range: "07:00–08:59" },
    { label: "사시", value: 9, range: "09:00–10:59" },
    { label: "오시", value: 11, range: "11:00–12:59" },
    { label: "미시", value: 13, range: "13:00–14:59" },
    { label: "신시", value: 15, range: "15:00–16:59" },
    { label: "유시", value: 17, range: "17:00–18:59" },
    { label: "술시", value: 19, range: "19:00–20:59" },
    { label: "해시", value: 21, range: "21:00–22:59" },
    { label: "야자시", value: 23, range: "23:00–23:59" },
  ];
