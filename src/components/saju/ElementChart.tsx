import { ELEMENT_META } from "@/lib/saju/dayMaster";
import type { ElementCount } from "@/lib/saju/types";

export default function ElementChart({ elements }: { elements: ElementCount[] }) {
  return (
    <div className="space-y-3">
      {elements.map((item, index) => {
        const meta = ELEMENT_META[item.element];
        const width = `${Math.max(item.ratio * 100, item.count > 0 ? 8 : 0)}%`;
        return (
          <div key={item.element} className="grid grid-cols-[3.5rem_1fr_2rem] items-center gap-3">
            <span className="text-sm" style={{ color: meta.ink }}>
              {meta.label}
            </span>
            <div className="h-2.5 overflow-hidden rounded-sm bg-black/5">
              <div
                className="bar-fill h-full rounded-sm"
                style={{
                  width,
                  background: meta.tone,
                  animationDelay: `${0.1 * index}s`,
                }}
              />
            </div>
            <span className="text-right text-sm text-[var(--ink-soft)]">{item.count}</span>
          </div>
        );
      })}
    </div>
  );
}
