import { ELEMENT_META } from "@/lib/saju/dayMaster";
import type { PillarView } from "@/lib/saju/types";

export default function PillarBoard({ pillars }: { pillars: PillarView[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {pillars.map((pillar, index) => {
        const stemMeta = ELEMENT_META[pillar.stemElement];
        const branchMeta = ELEMENT_META[pillar.branchElement];
        return (
          <div
            key={pillar.label}
            className="animate-rise overflow-hidden rounded-lg border border-[var(--line)] bg-white/80"
            style={{ animationDelay: `${0.08 * index}s` }}
          >
            <div className="border-b border-[var(--line)] px-3 py-2 text-center text-xs tracking-[0.2em] text-[var(--ink-soft)]">
              {pillar.label}
            </div>
            <div className="flex flex-col items-center gap-2 px-3 py-5">
              <CharBlock
                korean={pillar.stem}
                hanja={pillar.hanja[0] ?? "?"}
                elementLabel={stemMeta?.hanja ?? ""}
                color={stemMeta?.tone ?? "var(--ink)"}
                soft={stemMeta?.soft ?? "#eee"}
                sub={pillar.stemTenGod}
              />
              <div className="h-px w-8 bg-[var(--line)]" />
              <CharBlock
                korean={pillar.branch}
                hanja={pillar.hanja[1] ?? "?"}
                elementLabel={branchMeta?.hanja ?? ""}
                color={branchMeta?.tone ?? "var(--ink)"}
                soft={branchMeta?.soft ?? "#eee"}
                sub={pillar.branchTenGod}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CharBlock({
  korean,
  hanja,
  elementLabel,
  color,
  soft,
  sub,
}: {
  korean: string;
  hanja: string;
  elementLabel: string;
  color: string;
  soft: string;
  sub: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="flex h-16 w-16 flex-col items-center justify-center rounded-md"
        style={{ background: soft, color }}
      >
        <span className="font-[family-name:var(--font-display)] text-2xl leading-none">
          {korean === "?" ? "?" : hanja}
        </span>
        <span className="mt-1 text-[10px] tracking-wider opacity-80">
          {korean} {elementLabel}
        </span>
      </div>
      <span className="text-[11px] text-[var(--ink-soft)]">{sub}</span>
    </div>
  );
}
