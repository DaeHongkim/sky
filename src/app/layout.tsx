import type { Metadata } from "next";
import { Gowun_Dodum, Song_Myung } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const display = Song_Myung({
  weight: "400",
  variable: "--font-display",
});

const body = Gowun_Dodum({
  weight: "400",
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "하늘사주 — 사주팔자 시스템",
  description:
    "생년월일시로 사주팔자를 세우고 일간·오행·대운을 읽는 하늘사주 시스템",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen bg-[var(--paper)] text-[var(--ink)] antialiased">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
