import type { ManseryeokBasicInfo as BasicInfo } from "@/lib/saju/types";

export default function ManseryeokBasicInfo({ basic }: { basic: BasicInfo }) {
  return (
    <section
      aria-labelledby="manseryeok-basic-heading"
      className="animate-rise mb-10 overflow-hidden rounded-lg border border-[var(--line)] bg-white/75"
    >
      <div className="border-b border-[var(--line)] bg-[linear-gradient(90deg,rgba(159,184,212,0.28),rgba(247,244,239,0.9))] px-5 py-4 md:px-6">
        <p className="text-xs tracking-[0.28em] text-[var(--ink-soft)]">
          萬世曆 · BASIC
        </p>
        <h2
          id="manseryeok-basic-heading"
          className="mt-1 font-[family-name:var(--font-display)] text-2xl md:text-3xl"
        >
          {basic.name} 님의 만세력
        </h2>
      </div>

      <div className="space-y-5 px-5 py-6 md:px-6">
        <p className="font-[family-name:var(--font-display)] text-lg leading-relaxed tracking-wide text-[var(--ink)] md:text-xl">
          {basic.headline}
        </p>

        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <InfoRow label="시진" value={basic.hourBranchLabel} />
          <InfoRow label="음력" value={basic.lunarText.replace(/^음력\s*/, "")} />
          <InfoRow label="사주" value={basic.pillarsLine} />
          <InfoRow label="한자" value={basic.pillarsHanja} />
        </dl>
      </div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 border-t border-[var(--line)] pt-3 first:border-t-0 first:pt-0 sm:first:border-t sm:first:pt-3">
      <dt className="w-10 shrink-0 tracking-wider text-[var(--ink-soft)]">{label}</dt>
      <dd className="text-[var(--ink)]">{value}</dd>
    </div>
  );
}
