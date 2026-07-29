"use client";

import Link from "next/link";
import { formatWon, products } from "@/data/products";
import { ELEMENT_META } from "@/lib/saju/dayMaster";
import type { SajuAnalysis } from "@/lib/saju/types";
import ElementChart from "./ElementChart";
import PillarBoard from "./PillarBoard";

const report = products.find((p) => p.id === "report")!;
const yearly = products.find((p) => p.id === "yearly")!;

export default function SajuResult({
  analysis,
  onReset,
}: {
  analysis: SajuAnalysis;
  onReset: () => void;
}) {
  const dayMeta = ELEMENT_META[analysis.dayMasterElement];

  return (
    <section id="result" className="mx-auto max-w-5xl px-4 py-16 md:py-20">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div className="animate-rise">
          <p className="text-xs tracking-[0.25em] text-[var(--ink-soft)]">RESULT</p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl md:text-4xl">
            사주팔자
          </h2>
          <p className="mt-3 max-w-xl text-[var(--ink-soft)]">{analysis.summary}</p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="rounded-md border border-[var(--line)] px-4 py-2 text-sm text-[var(--ink-soft)] transition-colors hover:border-[var(--ink)] hover:text-[var(--ink)]"
        >
          다시 보기
        </button>
      </div>

      <div className="mb-4 text-sm text-[var(--ink-soft)]">
        음력 {analysis.lunar.year}.{analysis.lunar.month}.{analysis.lunar.day}
        {analysis.lunar.isLeapMonth ? " (윤달)" : ""}
        {analysis.voidBranches.length > 0 && (
          <span className="ml-3">공망 {analysis.voidBranches.join("·")}</span>
        )}
      </div>

      <PillarBoard pillars={analysis.pillars} />

      <div className="mt-12 grid gap-10 md:grid-cols-2">
        <section className="animate-rise-delay-1">
          <h3 className="font-[family-name:var(--font-display)] text-2xl">오행 균형</h3>
          <p className="mt-2 mb-6 text-sm text-[var(--ink-soft)]">
            천간·지지에 담긴 목·화·토·금·수의 분포입니다.
          </p>
          <ElementChart elements={analysis.elements} />
        </section>

        <section className="animate-rise-delay-2">
          <h3 className="font-[family-name:var(--font-display)] text-2xl">일간 해석</h3>
          <div
            className="mt-4 rounded-lg px-5 py-5"
            style={{ background: dayMeta.soft, color: dayMeta.ink }}
          >
            <div className="flex items-baseline gap-3">
              <span className="font-[family-name:var(--font-display)] text-4xl">
                {analysis.dayMasterHanja}
              </span>
              <span className="text-lg">
                {analysis.dayMaster} · {dayMeta.label}
              </span>
            </div>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed">
              {analysis.personality.slice(0, 1).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            {analysis.personality.length > 1 && (
              <p className="mt-4 text-sm opacity-80">
                나머지 성격·십신 해석은 정밀 리포트에서 이어집니다.
              </p>
            )}
          </div>
        </section>
      </div>

      <section className="relative mt-12 animate-rise overflow-hidden">
        <h3 className="font-[family-name:var(--font-display)] text-2xl">흐름 읽기</h3>
        <p className="mt-2 mb-6 text-sm text-[var(--ink-soft)]">
          오행과 십신을 바탕으로 한 기본 힌트입니다. 참고용으로만 보세요.
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          {analysis.fortuneHints.slice(0, 1).map((hint) => (
            <p
              key={hint}
              className="border-l-2 border-[var(--accent)] bg-white/60 px-4 py-3 text-sm leading-relaxed text-[var(--ink-soft)]"
            >
              {hint}
            </p>
          ))}
          {analysis.fortuneHints.slice(1).map((hint) => (
            <p
              key={hint}
              className="select-none border-l-2 border-[var(--line)] bg-white/40 px-4 py-3 text-sm leading-relaxed text-transparent blur-[5px]"
              aria-hidden
            >
              {hint}
            </p>
          ))}
        </div>
      </section>

      {analysis.luckPillars.length > 0 && (
        <section className="mt-12 animate-rise-delay-1">
          <h3 className="font-[family-name:var(--font-display)] text-2xl">대운</h3>
          <p className="mt-2 mb-6 text-sm text-[var(--ink-soft)]">
            {analysis.luckForward ? "순행" : "역행"} · {analysis.luckStartAge}세부터 · 미리보기
          </p>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {analysis.luckPillars.slice(0, 3).map((luck) => (
              <div
                key={`${luck.age}-${luck.korean}`}
                className="min-w-[5.5rem] rounded-lg border border-[var(--line)] bg-white/80 px-3 py-4 text-center"
              >
                <div className="text-xs text-[var(--ink-soft)]">{luck.age}세</div>
                <div className="mt-2 font-[family-name:var(--font-display)] text-xl">
                  {luck.korean}
                </div>
              </div>
            ))}
            {analysis.luckPillars.length > 3 && (
              <div className="flex min-w-[5.5rem] items-center justify-center rounded-lg border border-dashed border-[var(--line)] px-3 py-4 text-center text-xs text-[var(--ink-soft)]">
                +{analysis.luckPillars.length - 3}
                <br />
                리포트
              </div>
            )}
          </div>
        </section>
      )}

      <UpsellBand />
    </section>
  );
}

function UpsellBand() {
  return (
    <section className="mt-16 border-t border-[var(--line)] pt-12 animate-rise">
      <p className="text-xs tracking-[0.25em] text-[var(--ink-soft)]">NEXT</p>
      <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl md:text-3xl">
        기둥은 세웠습니다. 깊게 읽어 볼까요?
      </h3>
      <p className="mt-3 max-w-xl text-[var(--ink-soft)]">
        무료로는 사주팔자와 오행 요약을, 유료로는 정밀 해석과 연간 흐름을 제공합니다.
      </p>
      <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-[family-name:var(--font-display)] text-xl">{report.name}</p>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">
            {formatWon(report.price)} · {report.tagline}
          </p>
        </div>
        <Link
          href="/inquiry?product=report"
          className="inline-flex shrink-0 rounded-md bg-[var(--ink)] px-5 py-3 text-sm text-[var(--paper)] transition-opacity hover:opacity-90"
        >
          {report.cta}
        </Link>
      </div>
      <div className="mt-6 flex flex-col gap-6 border-t border-[var(--line)] pt-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-[family-name:var(--font-display)] text-xl">{yearly.name}</p>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">
            {formatWon(yearly.price)} · {yearly.tagline}
          </p>
        </div>
        <Link
          href="/pricing#yearly"
          className="inline-flex shrink-0 rounded-md border border-[var(--ink)]/25 px-5 py-3 text-sm text-[var(--ink)] transition-colors hover:border-[var(--ink)]"
        >
          요금 설계 보기
        </Link>
      </div>
    </section>
  );
}
