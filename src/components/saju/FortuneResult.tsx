"use client";

import { ELEMENT_META } from "@/lib/saju/dayMaster";
import type { DailyFortune, FortuneTone } from "@/lib/saju/dailyTypes";

const TONE_STYLE: Record<
  FortuneTone,
  { bar: string; badge: string; label: string }
> = {
  great: {
    bar: "var(--accent)",
    badge: "bg-[rgba(196,163,90,0.22)] text-[var(--accent-deep)]",
    label: "흐림 없이",
  },
  good: {
    bar: "var(--water)",
    badge: "bg-[rgba(47,95,138,0.12)] text-[var(--water)]",
    label: "순조롭게",
  },
  fair: {
    bar: "var(--earth)",
    badge: "bg-[rgba(138,106,61,0.14)] text-[var(--earth)]",
    label: "무난하게",
  },
  caution: {
    bar: "var(--fire)",
    badge: "bg-[rgba(184,79,62,0.12)] text-[var(--fire)]",
    label: "조심해서",
  },
};

export default function FortuneResult({
  fortune,
  onReset,
}: {
  fortune: DailyFortune;
  onReset: () => void;
}) {
  const dayMeta = ELEMENT_META[fortune.dayMasterElement];
  const tone = TONE_STYLE[fortune.tone];

  return (
    <section id="daily-result" className="mx-auto max-w-5xl px-4 py-16 md:py-20">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div className="animate-rise">
          <p className="text-xs tracking-[0.25em] text-[var(--ink-soft)]">DAILY FORTUNE</p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl md:text-4xl">
            {fortune.name} 님의 오늘
          </h2>
          <p className="mt-3 max-w-xl text-[var(--ink-soft)]">
            {fortune.dateText} ({fortune.weekday}) · {fortune.headline}
          </p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="rounded-md border border-[var(--line)] px-4 py-2 text-sm text-[var(--ink-soft)] transition-colors hover:border-[var(--ink)] hover:text-[var(--ink)]"
        >
          입력 수정
        </button>
      </div>

      {/* Overall score */}
      <div className="animate-rise mb-10 overflow-hidden rounded-lg border border-[var(--line)] bg-white/75">
        <div className="grid gap-0 md:grid-cols-[1fr_auto]">
          <div className="px-5 py-6 md:px-8 md:py-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`rounded-md px-2.5 py-1 text-xs tracking-wider ${tone.badge}`}>
                {fortune.level}
              </span>
              <span className="text-sm text-[var(--ink-soft)]">{tone.label}</span>
            </div>
            <p className="mt-4 font-[family-name:var(--font-display)] text-5xl tracking-tight md:text-6xl">
              {fortune.overallScore}
              <span className="ml-2 text-lg text-[var(--ink-soft)]">점</span>
            </p>
            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[var(--mist)]">
              <div
                className="bar-fill h-full rounded-full"
                style={{
                  width: `${fortune.overallScore}%`,
                  background: tone.bar,
                }}
              />
            </div>
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-[var(--ink-soft)]">
              일간 {fortune.dayMaster}({fortune.dayMasterHanja}) · {fortune.elementLabel}
              기준으로 오늘 일진 {fortune.todayPillar}의 천간 십신 {fortune.stemGod}, 지지
              십신 {fortune.branchGod}을 읽었습니다.
            </p>
          </div>

          <div
            className="flex flex-col justify-center gap-4 border-t border-[var(--line)] px-5 py-6 md:min-w-[14rem] md:border-l md:border-t-0 md:px-8"
            style={{ background: dayMeta.soft, color: dayMeta.ink }}
          >
            <div>
              <p className="text-xs tracking-[0.2em] opacity-70">今日 日柱</p>
              <p className="mt-2 font-[family-name:var(--font-display)] text-4xl">
                {fortune.todayPillarHanja}
              </p>
              <p className="mt-1 text-sm">
                {fortune.todayPillar} · {fortune.todayStemHanja}
                {fortune.todayBranchHanja}
              </p>
            </div>
            <div className="text-sm opacity-80">
              <p>
                천간 {fortune.todayStem}({fortune.stemElement}) → {fortune.stemGod}
              </p>
              <p className="mt-1">
                지지 {fortune.todayBranch}({fortune.branchElement}) → {fortune.branchGod}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <section className="animate-rise-delay-1">
        <h3 className="font-[family-name:var(--font-display)] text-2xl">분야별 흐름</h3>
        <p className="mt-2 mb-6 text-sm text-[var(--ink-soft)]">
          애정·재물·일·건강 — 오늘 하루의 결을 네 갈래로 나눕니다.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {fortune.categories.map((cat, i) => {
            const style = TONE_STYLE[cat.tone];
            return (
              <article
                key={cat.key}
                className={`rounded-lg border border-[var(--line)] bg-white/70 px-5 py-5 ${
                  i === 0
                    ? "animate-rise"
                    : i === 1
                      ? "animate-rise-delay-1"
                      : "animate-rise-delay-2"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <h4 className="font-[family-name:var(--font-display)] text-xl">{cat.title}</h4>
                  <span className={`rounded-md px-2 py-0.5 text-xs ${style.badge}`}>
                    {cat.level} · {cat.score}
                  </span>
                </div>
                <div className="mt-4 h-1 overflow-hidden rounded-full bg-[var(--mist)]">
                  <div
                    className="bar-fill h-full rounded-full"
                    style={{ width: `${cat.score}%`, background: style.bar }}
                  />
                </div>
                <p className="mt-4 text-sm leading-relaxed text-[var(--ink-soft)]">
                  {cat.summary}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* Lucky charms */}
      <section className="mt-12 animate-rise-delay-2">
        <h3 className="font-[family-name:var(--font-display)] text-2xl">오늘의 길신</h3>
        <p className="mt-2 mb-6 text-sm text-[var(--ink-soft)]">
          일간을 돕는 오행을 바탕으로 한 참고용 길색·방향입니다.
        </p>
        <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <LuckyCell label="색" value={fortune.luckyColor} />
          <LuckyCell label="방향" value={fortune.luckyDirection} />
          <LuckyCell label="물건" value={fortune.luckyItem} />
          <LuckyCell label="숫자" value={String(fortune.luckyNumber)} />
        </dl>
      </section>

      {/* Advice */}
      <section className="mt-12 animate-rise">
        <h3 className="font-[family-name:var(--font-display)] text-2xl">하루 조언</h3>
        <ul className="mt-6 space-y-3">
          {fortune.advice.map((line) => (
            <li
              key={line}
              className="border-l-2 border-[var(--accent)] bg-white/60 px-4 py-3 text-sm leading-relaxed text-[var(--ink-soft)]"
            >
              {line}
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}

function LuckyCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--line)] bg-white/70 px-4 py-4">
      <dt className="text-xs tracking-[0.2em] text-[var(--ink-soft)]">{label}</dt>
      <dd className="mt-2 font-[family-name:var(--font-display)] text-lg">{value}</dd>
    </div>
  );
}
