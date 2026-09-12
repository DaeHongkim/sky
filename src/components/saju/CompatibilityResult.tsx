"use client";

import type { BranchRelationType, CompatibilityAnalysis, ElementRelationType, RelationDetail } from "@/lib/saju/types";

export default function CompatibilityResult({
  analysis,
  onReset,
}: {
  analysis: CompatibilityAnalysis;
  onReset: () => void;
}) {
  return (
    <section id="compatibility-result" className="mx-auto max-w-5xl px-4 py-16 md:py-20">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div className="animate-rise">
          <p className="text-xs tracking-[0.25em] text-[var(--ink-soft)]">RESULT</p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl md:text-4xl">
            {analysis.tier}
          </h2>
          <p className="mt-3 max-w-xl text-[var(--ink-soft)]">{analysis.headline}</p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="rounded-md border border-[var(--line)] px-4 py-2 text-sm text-[var(--ink-soft)] transition-colors hover:border-[var(--ink)] hover:text-[var(--ink)]"
        >
          다시 보기
        </button>
      </div>

      <div className="animate-rise-delay-1 flex flex-col items-center gap-4 rounded-lg border border-[var(--line)] bg-white/70 px-6 py-10 text-center">
        <span className="text-xs tracking-[0.25em] text-[var(--ink-soft)]">MARRIAGE SCORE</span>
        <span className="font-[family-name:var(--font-display)] text-6xl text-[var(--ink)] md:text-7xl">
          {analysis.score}
          <span className="ml-1 text-2xl text-[var(--ink-soft)]">점</span>
        </span>
        <div className="h-2 w-full max-w-md overflow-hidden rounded-full bg-[var(--mist)]">
          <div
            className="bar-fill h-full rounded-full bg-[var(--accent-deep)]"
            style={{ width: `${analysis.score}%` }}
          />
        </div>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        <RelationCard
          title="일간 궁합"
          subtitle={`${analysis.personA.dayMaster} · ${analysis.personB.dayMaster}`}
          relation={analysis.dayMasterRelation}
        />
        <RelationCard
          title="배우자궁 (일지)"
          subtitle={`${analysis.personA.dayBranch} · ${analysis.personB.dayBranch}`}
          relation={analysis.dayBranchRelation}
        />
        <RelationCard
          title="띠 (년지)"
          subtitle={`${analysis.personA.yearBranch} · ${analysis.personB.yearBranch}`}
          relation={analysis.yearBranchRelation}
        />
      </div>

      <section className="mt-12 animate-rise">
        <h3 className="font-[family-name:var(--font-display)] text-2xl">오행 궁합</h3>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--ink-soft)]">
          {analysis.elementNote}
        </p>
      </section>

      <section className="mt-12 grid gap-8 md:grid-cols-2">
        <div className="animate-rise-delay-1">
          <h3 className="font-[family-name:var(--font-display)] text-2xl">좋은 점</h3>
          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-[var(--ink-soft)]">
            {analysis.strengths.map((line) => (
              <li key={line} className="border-l-2 border-[var(--accent)] bg-white/60 px-4 py-3">
                {line}
              </li>
            ))}
          </ul>
        </div>
        <div className="animate-rise-delay-2">
          <h3 className="font-[family-name:var(--font-display)] text-2xl">함께 유의할 점</h3>
          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-[var(--ink-soft)]">
            {analysis.cautions.map((line) => (
              <li
                key={line}
                className="border-l-2 border-[var(--ink-soft)] bg-white/60 px-4 py-3"
              >
                {line}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </section>
  );
}

function RelationCard({
  title,
  subtitle,
  relation,
}: {
  title: string;
  subtitle: string;
  relation: RelationDetail<ElementRelationType> | RelationDetail<BranchRelationType>;
}) {
  return (
    <div className="rounded-lg border border-[var(--line)] bg-white/70 px-5 py-5">
      <p className="text-xs tracking-[0.2em] text-[var(--ink-soft)]">{title}</p>
      <p className="mt-1 text-sm text-[var(--ink-soft)]">{subtitle}</p>
      <p className="mt-3 font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
        {relation.label}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">
        {relation.description}
      </p>
    </div>
  );
}
