import {
  calculateFourPillars,
  getBranchTenGod,
  getEarthlyBranchElement,
  getHeavenlyStemElement,
  getTenGod,
  type EarthlyBranch,
  type FiveElement as LibElement,
  type HeavenlyStem,
  type TenGod,
} from "manseryeok";
import {
  fillAxisMessage,
  TEN_GOD_CATEGORY,
} from "./dailyInterpret";
import {
  CATEGORY_LABELS,
  OWNER_PROFILE,
  type FortuneCategory,
} from "./profile";
import type { FiveElement } from "./types";
import { STEM_HANJA, BRANCH_HANJA } from "./dayMaster";

export interface DailyFortuneInput {
  year: number;
  month: number;
  day: number;
  /** 웹 검색으로 확인한 일진 (있으면 라이브러리 결과와 교차 검증) */
  verifiedIljin?: {
    stem: HeavenlyStem;
    branch: EarthlyBranch;
    source?: string;
  };
}

export interface CategoryReading {
  key: FortuneCategory;
  label: string;
  tone: "good" | "mixed" | "caution";
  fromStem: string;
  fromBranch: string;
  text: string;
}

export interface DailyFortuneResult {
  dateLabel: string;
  iljin: {
    stem: string;
    branch: string;
    korean: string;
    hanja: string;
  };
  verification: {
    libraryKorean: string;
    webKorean: string | null;
    matched: boolean;
    note: string;
  };
  stemTenGod: TenGod;
  branchTenGod: TenGod;
  stemElement: FiveElement;
  branchElement: FiveElement;
  fill: {
    fire: boolean;
    earth: boolean;
    filled: boolean;
    headline: string;
    detail: string;
  };
  waterWoodHeavy: boolean;
  colors: {
    recommend: string[];
    directions: string[];
    caution: string[];
    note: string;
  };
  categories: CategoryReading[];
  axisSummary: string;
  spouse: {
    summary: string;
    idealLabel: string;
    marriageYear: number;
    marriagePillar: string;
    marriageHanja: string;
    marriageNote: string;
  };
}

function asAppElement(el: LibElement): FiveElement {
  return el as FiveElement;
}

function mergeCategory(
  stemGod: TenGod,
  branchGod: TenGod,
  key: FortuneCategory,
): CategoryReading {
  const stemLine = TEN_GOD_CATEGORY[stemGod][key];
  const branchLine = TEN_GOD_CATEGORY[branchGod][key];

  const toneRank = { caution: 0, mixed: 1, good: 2 } as const;
  const tone =
    toneRank[stemLine.tone] <= toneRank[branchLine.tone]
      ? stemLine.tone
      : branchLine.tone;

  // 천간(드러난 기운)을 주축, 지지(바닥 기운)를 보조로 합침
  const text =
    stemGod === branchGod
      ? stemLine.text
      : `${stemLine.text} 지지(${branchGod})로는 ${branchLine.text}`;

  return {
    key,
    label: CATEGORY_LABELS[key],
    tone,
    fromStem: stemGod,
    fromBranch: branchGod,
    text,
  };
}

export function buildDailyFortune(input: DailyFortuneInput): DailyFortuneResult {
  const lib = calculateFourPillars({
    year: input.year,
    month: input.month,
    day: input.day,
    hour: 12,
    minute: 0,
  });

  const libStem = lib.day.heavenlyStem;
  const libBranch = lib.day.earthlyBranch;
  const libraryKorean = `${libStem}${libBranch}`;

  let stem = libStem;
  let branch = libBranch;
  let matched = true;
  let webKorean: string | null = null;

  if (input.verifiedIljin) {
    webKorean = `${input.verifiedIljin.stem}${input.verifiedIljin.branch}`;
    matched =
      input.verifiedIljin.stem === libStem &&
      input.verifiedIljin.branch === libBranch;
    // 웹 확인값을 우선 (사용자 규칙: 웹 검색으로 확인한 뒤 풀이)
    stem = input.verifiedIljin.stem;
    branch = input.verifiedIljin.branch;
  }

  const dayMaster = OWNER_PROFILE.dayMaster;
  const stemTenGod = getTenGod(dayMaster, stem);
  const branchTenGod = getBranchTenGod(dayMaster, branch);
  const stemElement = asAppElement(getHeavenlyStemElement(stem));
  const branchElement = asAppElement(getEarthlyBranchElement(branch));

  const fillsFire = stemElement === "화" || branchElement === "화";
  const fillsEarth = stemElement === "토" || branchElement === "토";
  const fill = {
    fire: fillsFire,
    earth: fillsEarth,
    ...fillAxisMessage(fillsFire, fillsEarth),
  };

  const waterWoodHeavy =
    (stemElement === "수" || stemElement === "목") &&
    (branchElement === "수" || branchElement === "목");

  const colors = {
    recommend: [...OWNER_PROFILE.colorFill.prefer],
    directions: [...OWNER_PROFILE.colorFill.preferDirections],
    caution: waterWoodHeavy
      ? [...OWNER_PROFILE.colorFill.avoidWhenWaterWoodHeavy]
      : [],
    note: waterWoodHeavy
      ? "水·木이 겹친 날입니다. 검정·초록은 줄이고, 火土 보완 색(빨강·주황·노랑·황토)과 남쪽을 우선하세요."
      : fill.filled
        ? "火土가 들어오는 날에도 색·방위는 같은 원칙으로 보강하면 흐름이 선명해집니다."
        : "火土 공백 보완이 우선입니다. 빨강·주황·노랑·황토색과 남쪽 방위를 의식적으로 쓰세요.",
  };

  const categoryKeys = Object.keys(CATEGORY_LABELS) as FortuneCategory[];
  const categories = categoryKeys.map((key) =>
    mergeCategory(stemTenGod, branchTenGod, key),
  );

  const axisSummary = [
    `일간 ${OWNER_PROFILE.dayMasterHanja}金 기준 오늘 천간은 ${stemTenGod}, 지지는 ${branchTenGod}.`,
    fill.headline + " — " + fill.detail,
  ].join(" ");

  const dateLabel = `${input.year}년 ${input.month}월 ${input.day}일`;

  return {
    dateLabel,
    iljin: {
      stem,
      branch,
      korean: `${stem}${branch}`,
      hanja: `${STEM_HANJA[stem] ?? stem}${BRANCH_HANJA[branch] ?? branch}`,
    },
    verification: {
      libraryKorean,
      webKorean,
      matched,
      note: input.verifiedIljin
        ? matched
          ? `웹 확인 일진(${webKorean})과 만세력 계산이 일치합니다.${input.verifiedIljin.source ? ` 출처: ${input.verifiedIljin.source}` : ""}`
          : `웹 확인(${webKorean})과 라이브러리(${libraryKorean})가 다릅니다. 풀이는 웹 확인값을 따릅니다.`
        : "웹에서 일진을 확인한 뒤 verifiedIljin을 넘기면 교차 검증됩니다.",
    },
    stemTenGod,
    branchTenGod,
    stemElement,
    branchElement,
    fill,
    waterWoodHeavy,
    colors,
    categories,
    axisSummary,
    spouse: {
      summary: OWNER_PROFILE.spouse.summary,
      idealLabel: OWNER_PROFILE.spouse.idealLabel,
      marriageYear: OWNER_PROFILE.spouse.marriageYear,
      marriagePillar: OWNER_PROFILE.spouse.marriagePillar,
      marriageHanja: OWNER_PROFILE.spouse.marriageHanja,
      marriageNote: OWNER_PROFILE.spouse.marriageNote,
    },
  };
}

/** 브라우저/서버에서 ‘오늘’(로컬) 날짜 */
export function localTodayParts(now = new Date()) {
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
}
