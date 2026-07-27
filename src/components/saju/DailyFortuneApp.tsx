"use client";

import { useMemo, useState } from "react";
import {
  buildDailyFortune,
  localTodayParts,
  type DailyFortuneResult,
} from "@/lib/saju/dailyFortune";
import { OWNER_PROFILE } from "@/lib/saju/profile";
import type { EarthlyBranch, HeavenlyStem } from "manseryeok";
import { HEAVENLY_STEMS, EARTHLY_BRANCHES } from "manseryeok";

const TONE_STYLE = {
  good: "border-l-[var(--wood)] bg-[#edf6f1]",
  mixed: "border-l-[var(--accent-deep)] bg-[#f7f1e4]",
  caution: "border-l-[var(--fire)] bg-[#f8ece8]",
} as const;

function sourceFor(year: number, month: number, day: number) {
  if (year === 2026 && month === 7 && day === 27) {
    return "KASI 달력·톱스타뉴스 (임인일 교차 확인)";
  }
  return "웹/만세력에서 확인한 일진";
}

export default function DailyFortuneApp() {
  const today = localTodayParts();
  const [year, setYear] = useState(today.year);
  const [month, setMonth] = useState(today.month);
  const [day, setDay] = useState(today.day);
  const [useWebVerify, setUseWebVerify] = useState(true);
  const [override, setOverride] = useState<{
    stem: HeavenlyStem;
    branch: EarthlyBranch;
  } | null>(null);
  const [webSource, setWebSource] = useState(sourceFor(today.year, today.month, today.day));

  const setDate = (next: { year?: number; month?: number; day?: number }) => {
    const y = next.year ?? year;
    const m = next.month ?? month;
    const d = next.day ?? day;
    if (next.year !== undefined) setYear(next.year);
    if (next.month !== undefined) setMonth(next.month);
    if (next.day !== undefined) setDay(next.day);
    setOverride(null);
    setWebSource(sourceFor(y, m, d));
  };

  const libraryPreview = useMemo(() => {
    try {
      return buildDailyFortune({ year, month, day });
    } catch {
      return null;
    }
  }, [year, month, day]);

  const webStem =
    override?.stem ?? (libraryPreview?.iljin.stem as HeavenlyStem | undefined) ?? "갑";
  const webBranch =
    override?.branch ??
    (libraryPreview?.iljin.branch as EarthlyBranch | undefined) ??
    "자";

  const result: DailyFortuneResult | null = useMemo(() => {
    try {
      return buildDailyFortune({
        year,
        month,
        day,
        verifiedIljin: useWebVerify
          ? { stem: webStem, branch: webBranch, source: webSource }
          : undefined,
      });
    } catch {
      return null;
    }
  }, [year, month, day, useWebVerify, webStem, webBranch, webSource]);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-28">
      <header className="mb-10">
        <p className="text-xs tracking-[0.25em] text-[var(--ink-soft)]">DAILY</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl md:text-5xl">
          매일 운세
        </h1>
        <p className="mt-3 max-w-2xl text-[var(--ink-soft)]">
          일간 {OWNER_PROFILE.dayMasterHanja}金 · 원국 火·土 공백 틀을 유지한 채,
          그날 일진의 육친으로 사업·대인·SNS·판단·컨디션·이성운을 읽습니다.
          배우자운은 일진과 분리된 평생운 고정 기준입니다.
        </p>
      </header>

      <section className="mb-10 grid gap-4 rounded-lg border border-[var(--line)] bg-white/70 p-4 md:grid-cols-[1fr_auto]">
        <div className="grid grid-cols-3 gap-3">
          <DateField
            label="년"
            value={year}
            min={1900}
            max={2100}
            onChange={(n) => setDate({ year: n })}
          />
          <DateField
            label="월"
            value={month}
            min={1}
            max={12}
            onChange={(n) => setDate({ month: n })}
          />
          <DateField
            label="일"
            value={day}
            min={1}
            max={31}
            onChange={(n) => setDate({ day: n })}
          />
        </div>
        <button
          type="button"
          className="h-12 self-end rounded-md bg-[var(--ink)] px-4 text-sm text-[var(--paper)]"
          onClick={() => {
            const t = localTodayParts();
            setDate({ year: t.year, month: t.month, day: t.day });
          }}
        >
          오늘로
        </button>
      </section>

      <section className="mb-10 space-y-3 rounded-lg border border-[var(--line)] bg-[var(--mist)]/50 p-4">
        <label className="flex items-center gap-2 text-sm text-[var(--ink-soft)]">
          <input
            type="checkbox"
            checked={useWebVerify}
            onChange={(e) => setUseWebVerify(e.target.checked)}
            className="accent-[var(--accent-deep)]"
          />
          웹에서 확인한 일진으로 풀이 (권장)
        </label>
        {useWebVerify && (
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-sm">
              <span className="mb-1 block text-xs tracking-wider text-[var(--ink-soft)]">
                확인 천간
              </span>
              <select
                className="h-11 w-full rounded-md border border-[var(--line)] bg-white px-3"
                value={webStem}
                onChange={(e) =>
                  setOverride({
                    stem: e.target.value as HeavenlyStem,
                    branch: webBranch,
                  })
                }
              >
                {HEAVENLY_STEMS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-xs tracking-wider text-[var(--ink-soft)]">
                확인 지지
              </span>
              <select
                className="h-11 w-full rounded-md border border-[var(--line)] bg-white px-3"
                value={webBranch}
                onChange={(e) =>
                  setOverride({
                    stem: webStem,
                    branch: e.target.value as EarthlyBranch,
                  })
                }
              >
                {EARTHLY_BRANCHES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm sm:col-span-1">
              <span className="mb-1 block text-xs tracking-wider text-[var(--ink-soft)]">
                출처 메모
              </span>
              <input
                className="h-11 w-full rounded-md border border-[var(--line)] bg-white px-3 text-sm"
                value={webSource}
                onChange={(e) => setWebSource(e.target.value)}
              />
            </label>
          </div>
        )}
      </section>

      {!result ? (
        <p className="text-[var(--fire)]">날짜를 확인해 주세요.</p>
      ) : (
        <DailyResultView result={result} />
      )}
    </div>
  );
}

function DateField({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-xs tracking-wider text-[var(--ink-soft)]">
        {label}
      </span>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-12 w-full rounded-md border border-[var(--line)] bg-white px-3"
      />
    </label>
  );
}

function DailyResultView({ result }: { result: DailyFortuneResult }) {
  return (
    <div className="space-y-12">
      <section className="animate-rise">
        <p className="text-sm text-[var(--ink-soft)]">{result.dateLabel}</p>
        <div className="mt-2 flex flex-wrap items-end gap-4">
          <h2 className="font-[family-name:var(--font-display)] text-4xl">
            {result.iljin.hanja}
            <span className="ml-3 text-2xl text-[var(--ink-soft)]">
              {result.iljin.korean}일
            </span>
          </h2>
          <div className="text-sm text-[var(--ink-soft)]">
            천간 <strong className="text-[var(--ink)]">{result.stemTenGod}</strong>
            <span className="mx-2">·</span>
            지지 <strong className="text-[var(--ink)]">{result.branchTenGod}</strong>
          </div>
        </div>
        <p className="mt-4 max-w-3xl leading-relaxed text-[var(--ink-soft)]">
          {result.axisSummary}
        </p>
        <p className="mt-2 text-xs text-[var(--ink-soft)]">{result.verification.note}</p>
      </section>

      <section
        className={`animate-rise-delay-1 rounded-lg border px-5 py-5 ${
          result.fill.filled
            ? "border-[var(--fire)]/30 bg-[#f8ece8]"
            : "border-[var(--line)] bg-white/80"
        }`}
      >
        <h3 className="font-[family-name:var(--font-display)] text-2xl">
          핵심 축 · 火土 채움
        </h3>
        <p className="mt-2 text-lg">{result.fill.headline}</p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">
          {result.fill.detail}
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Tag ok={result.fill.fire}>火 {result.fill.fire ? "채움" : "공백"}</Tag>
          <Tag ok={result.fill.earth}>土 {result.fill.earth ? "채움" : "공백"}</Tag>
          <Tag ok={!result.waterWoodHeavy}>
            水木 {result.waterWoodHeavy ? "과다 주의" : "과다 아님"}
          </Tag>
        </div>
      </section>

      <section className="animate-rise-delay-2">
        <h3 className="font-[family-name:var(--font-display)] text-2xl">색·방위</h3>
        <p className="mt-2 text-sm text-[var(--ink-soft)]">{result.colors.note}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <InfoBlock title="추천 색" items={result.colors.recommend} />
          <InfoBlock title="추천 방위" items={result.colors.directions} />
          <InfoBlock
            title="주의"
            items={
              result.colors.caution.length > 0
                ? result.colors.caution
                : ["해당 없음"]
            }
          />
        </div>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-2xl">영역별 풀이</h3>
        <p className="mt-2 mb-6 text-sm text-[var(--ink-soft)]">
          천간 육친을 주축으로, 지지 육친을 바닥 기운으로 합쳐 읽습니다.
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          {result.categories.map((c) => (
            <article
              key={c.key}
              className={`border-l-4 px-4 py-4 ${TONE_STYLE[c.tone]}`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <h4 className="font-[family-name:var(--font-display)] text-xl">
                  {c.label}
                </h4>
                <span className="text-xs text-[var(--ink-soft)]">
                  {c.fromStem}/{c.fromBranch}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">
                {c.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-[var(--line)] bg-white/80 px-5 py-6">
        <p className="text-xs tracking-[0.2em] text-[var(--ink-soft)]">
          LIFELONG · 일진 무관
        </p>
        <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl">
          배우자운 (고정)
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-[var(--ink-soft)]">
          {result.spouse.summary}
        </p>
        <p className="mt-3 text-sm">
          최적 배우자상: <strong>{result.spouse.idealLabel}</strong>
        </p>
        <p className="mt-2 text-sm">
          결혼 적기:{" "}
          <strong>
            {result.spouse.marriageYear}년 {result.spouse.marriageHanja}(
            {result.spouse.marriagePillar})
          </strong>
        </p>
        <p className="mt-1 text-xs text-[var(--ink-soft)]">{result.spouse.marriageNote}</p>
      </section>
    </div>
  );
}

function Tag({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`rounded-md px-3 py-1 ${
        ok ? "bg-[var(--ink)] text-[var(--paper)]" : "bg-black/5 text-[var(--ink-soft)]"
      }`}
    >
      {children}
    </span>
  );
}

function InfoBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-md border border-[var(--line)] bg-white/80 px-4 py-3">
      <div className="text-xs tracking-wider text-[var(--ink-soft)]">{title}</div>
      <div className="mt-2 text-sm">{items.join(" · ")}</div>
    </div>
  );
}
