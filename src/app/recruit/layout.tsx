import type { Metadata, Viewport } from "next";
import { Gothic_A1, Noto_Serif_KR } from "next/font/google";
import "./recruit.css";
import { RecruitShell } from "@/components/recruit/RecruitShell";

const sans = Gothic_A1({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-hr-sans",
});

const display = Noto_Serif_KR({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-hr-display",
});

export const metadata: Metadata = {
  title: "HIHONG RECRUIT | HIHONG PEOPLE",
  description:
    "HIHONG PEOPLE 외국인·국내 인재 채용 플랫폼 — 지원부터 계약·채용확정까지",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HIHONG RECRUIT",
  },
};

export const viewport: Viewport = {
  themeColor: "#a95b34",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RecruitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${sans.variable} ${display.variable} hr-shell`}>
      <RecruitShell>{children}</RecruitShell>
    </div>
  );
}
