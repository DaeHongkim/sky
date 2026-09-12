"use client";

import { startTransition, useState } from "react";
import { analyzeCompatibility } from "@/lib/saju/compatibility";
import type { BirthInput, CompatibilityAnalysis } from "@/lib/saju/types";
import BirthForm from "./BirthForm";
import CompatibilityResult from "./CompatibilityResult";

const defaultPersonA: BirthInput = {
  year: 1992,
  month: 10,
  day: 24,
  hour: 5,
  minute: 30,
  gender: "male",
  isLunar: false,
  isLeapMonth: false,
};

const defaultPersonB: BirthInput = {
  year: 1994,
  month: 3,
  day: 12,
  hour: null,
  minute: 0,
  gender: "female",
  isLunar: false,
  isLeapMonth: false,
};

export default function CompatibilityApp() {
  const [personA, setPersonA] = useState<BirthInput>(defaultPersonA);
  const [personB, setPersonB] = useState<BirthInput>(defaultPersonB);
  const [analysis, setAnalysis] = useState<CompatibilityAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    try {
      const next = analyzeCompatibility(personA, personB);
      startTransition(() => {
        setAnalysis(next);
        setError(null);
      });
      requestAnimationFrame(() => {
        document.getElementById("compatibility-result")?.scrollIntoView({ behavior: "smooth" });
      });
    } catch (err) {
      setAnalysis(null);
      setError(
        err instanceof Error
          ? err.message
          : "궁합을 계산하지 못했습니다. 생년월일을 확인해 주세요.",
      );
    }
  };

  return (
    <>
      <section className="mx-auto max-w-5xl px-4 pb-16 pt-28 md:pt-32">
        <p className="animate-rise text-xs tracking-[0.35em] text-[var(--ink-soft)]">
          MARRIAGE SCORE
        </p>
        <h1 className="animate-rise-delay-1 mt-3 font-[family-name:var(--font-display)] text-4xl leading-[1.05] tracking-tight text-[var(--ink)] md:text-6xl">
          결혼 궁합
        </h1>
        <p className="animate-rise-delay-2 mt-4 max-w-xl text-base leading-relaxed text-[var(--ink-soft)] md:text-lg">
          두 사람의 생년월일시로 일간·배우자궁·오행을 견주어 궁합 점수를 계산합니다.
        </p>

        <form
          id="compatibility-form"
          className="mt-10 space-y-10"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className="grid gap-10 md:grid-cols-2">
            <div className="animate-rise-delay-1">
              <h2 className="mb-4 font-[family-name:var(--font-display)] text-xl">나</h2>
              <BirthForm value={personA} onChange={setPersonA} renderAsForm={false} />
            </div>
            <div className="animate-rise-delay-2">
              <h2 className="mb-4 font-[family-name:var(--font-display)] text-xl">상대방</h2>
              <BirthForm value={personB} onChange={setPersonB} renderAsForm={false} />
            </div>
          </div>

          {error && (
            <p className="text-sm text-[var(--fire)]" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-md bg-[var(--ink)] px-6 py-4 text-[var(--paper)] transition-all hover:-translate-y-0.5 hover:bg-[var(--accent-deep)] md:w-auto"
          >
            <span className="font-[family-name:var(--font-display)] text-lg tracking-wide">
              궁합 점수 보기
            </span>
            <span className="text-[var(--accent)]">→</span>
          </button>
        </form>
      </section>

      {analysis && (
        <div className="border-t border-[var(--line)] bg-[var(--mist)]/60">
          <CompatibilityResult
            analysis={analysis}
            onReset={() => {
              setAnalysis(null);
              document.getElementById("compatibility-form")?.scrollIntoView({ behavior: "smooth" });
            }}
          />
        </div>
      )}

      <footer className="border-t border-[var(--line)] px-4 py-10 text-center text-xs text-[var(--ink-soft)]">
        하늘사주 · 만세력 기반 참고용 해석입니다. 중요한 결정은 전문가와 함께하세요.
      </footer>
    </>
  );
}
