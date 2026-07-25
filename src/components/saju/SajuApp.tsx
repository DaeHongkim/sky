"use client";

import { startTransition, useState } from "react";
import { analyzeSaju } from "@/lib/saju/analyze";
import type { BirthInput, SajuAnalysis } from "@/lib/saju/types";
import BirthForm from "./BirthForm";
import SajuResult from "./SajuResult";

/** 김대홍 — 基本 1992년 3월 15일 (양력) 15:49 · 乾命(남) */
const defaultBirth: BirthInput = {
  name: "김대홍",
  year: 1992,
  month: 3,
  day: 15,
  hour: 15,
  minute: 49,
  gender: "male",
  isLunar: false,
  isLeapMonth: false,
};

const initialAnalysis = analyzeSaju(defaultBirth);

export default function SajuApp() {
  const [birth, setBirth] = useState<BirthInput>(defaultBirth);
  const [analysis, setAnalysis] = useState<SajuAnalysis | null>(initialAnalysis);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    try {
      const next = analyzeSaju(birth);
      startTransition(() => {
        setAnalysis(next);
        setError(null);
      });
      requestAnimationFrame(() => {
        document.getElementById("result")?.scrollIntoView({ behavior: "smooth" });
      });
    } catch (err) {
      setAnalysis(null);
      setError(
        err instanceof Error
          ? err.message
          : "사주를 계산하지 못했습니다. 생년월일을 확인해 주세요.",
      );
    }
  };

  return (
    <>
      <section className="relative min-h-[100svh] overflow-hidden">
        <HeroBackdrop />

        <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 md:justify-center md:pb-24 md:pt-24">
          <div className="max-w-2xl">
            <p className="animate-rise text-xs tracking-[0.35em] text-[var(--ink-soft)]">
              SKY SAJU
            </p>
            <h1 className="animate-rise-delay-1 mt-3 font-[family-name:var(--font-display)] text-5xl leading-[1.05] tracking-tight text-[var(--ink)] md:text-7xl">
              하늘사주
            </h1>
            <p className="animate-rise-delay-2 mt-5 max-w-md text-base leading-relaxed text-[var(--ink-soft)] md:text-lg">
              만세력 기본 정보로 네 기둥을 세우고, 일간과 오행의 결을 읽습니다.
            </p>
            {analysis && (
              <p className="animate-rise-delay-2 mt-4 text-sm text-[var(--ink-soft)]">
                지금 보는 만세력 · {analysis.basic.name} · {analysis.basic.headline}
              </p>
            )}
          </div>

          <div className="mt-10 md:mt-12">
            <BirthForm value={birth} onChange={setBirth} onSubmit={handleSubmit} />
            {error && (
              <p className="mt-4 text-sm text-[var(--fire)]" role="alert">
                {error}
              </p>
            )}
          </div>
        </div>
      </section>

      {analysis && (
        <div className="border-t border-[var(--line)] bg-[var(--mist)]/60">
          <SajuResult
            analysis={analysis}
            onReset={() => {
              document.getElementById("saju-form")?.scrollIntoView({ behavior: "smooth" });
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

function HeroBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, var(--sky-top) 0%, var(--sky-mid) 42%, var(--sky-low) 68%, var(--paper) 100%)",
        }}
      />

      <div className="animate-breath absolute -left-20 top-[18%] h-56 w-56 rounded-full bg-white/35 blur-3xl" />
      <div className="animate-drift absolute right-[8%] top-[22%] h-40 w-72 rounded-full bg-white/30 blur-3xl" />

      <svg
        className="absolute bottom-0 left-0 w-full text-[var(--ink)]"
        viewBox="0 0 1440 420"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          fillOpacity="0.08"
          d="M0 260C180 220 280 180 420 190C560 200 620 260 780 250C940 240 1040 160 1180 170C1320 180 1380 220 1440 230V420H0V260Z"
        />
        <path
          fill="currentColor"
          fillOpacity="0.14"
          d="M0 310C160 280 260 250 400 255C560 262 640 320 800 300C980 276 1080 210 1220 230C1340 246 1400 280 1440 290V420H0V310Z"
        />
        <path
          fill="var(--paper)"
          d="M0 350C200 330 320 300 480 310C650 322 720 360 880 345C1060 328 1180 290 1320 310C1380 318 1420 330 1440 336V420H0V350Z"
        />
      </svg>

      <div
        className="absolute left-1/2 top-[26%] h-28 w-28 -translate-x-1/2 rounded-full md:top-[22%] md:h-36 md:w-36"
        style={{
          background:
            "radial-gradient(circle, rgba(255,236,200,0.9) 0%, rgba(255,220,160,0.35) 45%, rgba(255,220,160,0) 72%)",
        }}
      />
    </div>
  );
}
