"use client";

import { startTransition, useState } from "react";
import Link from "next/link";
import { analyzeDailyFortune } from "@/lib/saju/dailyFortune";
import type { BirthInput } from "@/lib/saju/types";
import type { DailyFortune } from "@/lib/saju/dailyTypes";
import BirthForm from "./BirthForm";
import FortuneResult from "./FortuneResult";

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

const initialFortune = analyzeDailyFortune(defaultBirth);

export default function DailyFortuneApp() {
  const [birth, setBirth] = useState<BirthInput>(defaultBirth);
  const [fortune, setFortune] = useState<DailyFortune | null>(initialFortune);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    try {
      const next = analyzeDailyFortune(birth);
      startTransition(() => {
        setFortune(next);
        setError(null);
      });
      requestAnimationFrame(() => {
        document.getElementById("daily-result")?.scrollIntoView({ behavior: "smooth" });
      });
    } catch (err) {
      setFortune(null);
      setError(
        err instanceof Error
          ? err.message
          : "오늘의 운세를 계산하지 못했습니다. 생년월일을 확인해 주세요.",
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
              TODAY · 日辰
            </p>
            <h1 className="animate-rise-delay-1 mt-3 font-[family-name:var(--font-display)] text-5xl leading-[1.05] tracking-tight text-[var(--ink)] md:text-7xl">
              오늘의 운세
            </h1>
            <p className="animate-rise-delay-2 mt-5 max-w-md text-base leading-relaxed text-[var(--ink-soft)] md:text-lg">
              내 일간과 오늘 일진의 십신으로, 하루의 결을 짧게 읽습니다.
            </p>
            {fortune && (
              <p className="animate-rise-delay-2 mt-4 text-sm text-[var(--ink-soft)]">
                {fortune.dateText} ({fortune.weekday}) · 일진 {fortune.todayPillar}
                ({fortune.todayPillarHanja}) · {fortune.level}
              </p>
            )}
            <p className="animate-rise-delay-2 mt-3">
              <Link
                href="/"
                className="text-sm text-[var(--accent-deep)] underline-offset-4 hover:underline"
              >
                사주팔자 보기 →
              </Link>
            </p>
          </div>

          <div className="mt-10 md:mt-12">
            <BirthForm
              value={birth}
              onChange={setBirth}
              onSubmit={handleSubmit}
              submitLabel="오늘의 운세 보기"
            />
            <p className="mt-3 text-xs text-[var(--ink-soft)]">
              생년월일을 입력한 뒤 시작을 누르면 오늘 날짜 기준 운세가 열립니다.
            </p>
            {error && (
              <p className="mt-4 text-sm text-[var(--fire)]" role="alert">
                {error}
              </p>
            )}
          </div>
        </div>
      </section>

      {fortune && (
        <div className="border-t border-[var(--line)] bg-[var(--mist)]/60">
          <FortuneResult
            fortune={fortune}
            onReset={() => {
              document.getElementById("saju-form")?.scrollIntoView({ behavior: "smooth" });
            }}
          />
        </div>
      )}

      <footer className="border-t border-[var(--line)] px-4 py-10 text-center text-xs text-[var(--ink-soft)]">
        하늘사주 · 오늘의 운세는 일진·십신 기반 참고용 해석입니다.
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
            "linear-gradient(165deg, #7a9bb8 0%, var(--sky-mid) 38%, var(--sky-low) 65%, var(--paper) 100%)",
        }}
      />

      <div className="animate-breath absolute -right-16 top-[12%] h-64 w-64 rounded-full bg-white/30 blur-3xl" />
      <div className="animate-drift absolute left-[6%] top-[30%] h-36 w-64 rounded-full bg-white/25 blur-3xl" />

      {/* Soft sun arc for "today" */}
      <div
        className="absolute left-1/2 top-[18%] h-32 w-32 -translate-x-1/2 rounded-full md:top-[14%] md:h-40 md:w-40"
        style={{
          background:
            "radial-gradient(circle, rgba(255,236,200,0.95) 0%, rgba(255,220,160,0.4) 42%, rgba(255,220,160,0) 70%)",
        }}
      />

      <svg
        className="absolute bottom-0 left-0 w-full text-[var(--ink)]"
        viewBox="0 0 1440 420"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          fillOpacity="0.07"
          d="M0 240C200 200 320 170 480 185C640 200 720 260 880 245C1040 230 1160 160 1300 175C1380 185 1420 210 1440 220V420H0V240Z"
        />
        <path
          fill="currentColor"
          fillOpacity="0.12"
          d="M0 300C180 270 300 240 460 250C640 262 740 320 900 300C1080 276 1180 220 1320 240C1380 250 1420 270 1440 280V420H0V300Z"
        />
        <path
          fill="var(--paper)"
          d="M0 345C220 325 340 300 500 310C680 322 760 360 920 345C1100 328 1220 295 1360 315C1400 322 1425 330 1440 334V420H0V345Z"
        />
      </svg>
    </div>
  );
}
