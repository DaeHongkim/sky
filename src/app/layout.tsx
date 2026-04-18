import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "부산 점포 개발 플랫폼",
  description: "부산 기반 점포 개발 및 상권 분석 서비스",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${geist.className} bg-gray-50 min-h-screen`}>
        <Navbar />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}
