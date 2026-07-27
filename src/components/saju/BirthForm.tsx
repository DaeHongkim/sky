"use client";

import { HOUR_OPTIONS } from "@/lib/saju/analyze";
import type { BirthInput, Gender } from "@/lib/saju/types";

interface BirthFormProps {
  value: BirthInput;
  onChange: (next: BirthInput) => void;
  onSubmit: () => void;
}

const inputClass =
  "w-full h-12 rounded-md border border-[var(--line)] bg-white/70 px-3.5 text-[var(--ink)] outline-none focus:border-[var(--ink-soft)] focus:shadow-[0_0_0_3px_rgba(159,184,212,0.35)]";

export default function BirthForm({ value, onChange, onSubmit }: BirthFormProps) {
  const set = <K extends keyof BirthInput>(key: K, next: BirthInput[K]) => {
    onChange({ ...value, [key]: next });
  };

  return (
    <form
      id="saju-form"
      className="animate-rise-delay-2 w-full max-w-xl space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div className="grid grid-cols-3 gap-3">
        <Field label="년">
          <input
            type="number"
            min={1900}
            max={2100}
            required
            value={value.year}
            onChange={(e) => set("year", Number(e.target.value))}
            className={inputClass}
          />
        </Field>
        <Field label="월">
          <input
            type="number"
            min={1}
            max={12}
            required
            value={value.month}
            onChange={(e) => set("month", Number(e.target.value))}
            className={inputClass}
          />
        </Field>
        <Field label="일">
          <input
            type="number"
            min={1}
            max={31}
            required
            value={value.day}
            onChange={(e) => set("day", Number(e.target.value))}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="태어난 시">
          <select
            value={value.hour === null ? "null" : String(value.hour)}
            onChange={(e) => {
              const raw = e.target.value;
              set("hour", raw === "null" ? null : Number(raw));
            }}
            className={inputClass}
          >
            {HOUR_OPTIONS.map((opt) => (
              <option
                key={String(opt.value)}
                value={opt.value === null ? "null" : String(opt.value)}
              >
                {opt.label} · {opt.range}
              </option>
            ))}
          </select>
        </Field>
        <Field label="성별">
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ["male", "남성"],
                ["female", "여성"],
              ] as [Gender, string][]
            ).map(([g, label]) => (
              <button
                key={g}
                type="button"
                onClick={() => set("gender", g)}
                className={`h-12 rounded-md border text-sm transition-colors ${
                  value.gender === g
                    ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]"
                    : "border-[var(--line)] bg-white/70 text-[var(--ink-soft)] hover:border-[var(--ink-soft)]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--ink-soft)]">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={value.isLunar}
            onChange={(e) => set("isLunar", e.target.checked)}
            className="accent-[var(--accent-deep)]"
          />
          음력 입력
        </label>
        {value.isLunar && (
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={value.isLeapMonth}
              onChange={(e) => set("isLeapMonth", e.target.checked)}
              className="accent-[var(--accent-deep)]"
            />
            윤달
          </label>
        )}
      </div>

      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-md bg-[var(--ink)] px-6 py-4 text-[var(--paper)] transition-all hover:-translate-y-0.5 hover:bg-[var(--accent-deep)]"
      >
        <span className="font-[family-name:var(--font-display)] text-lg tracking-wide">
          사주 보기
        </span>
        <span className="text-[var(--accent)]">→</span>
      </button>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs tracking-[0.18em] text-[var(--ink-soft)] uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}
