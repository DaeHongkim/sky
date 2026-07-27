import type { Metadata } from "next";
import DailyFortuneApp from "@/components/saju/DailyFortuneApp";

export const metadata: Metadata = {
  title: "오늘의 운세 — 하늘사주",
  description: "내 일간과 오늘 일진의 십신으로 읽는 하루 운세",
};

export default function FortunePage() {
  return <DailyFortuneApp />;
}
