import type { Metadata, Viewport } from "next";
import { Manrope, Noto_Sans_KR } from "next/font/google";
import "./recruit.css";
import { RecruitShell } from "@/components/recruit/RecruitShell";

const sans = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-hr-sans",
});

const display = Manrope({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-hr-display",
});

export const metadata: Metadata = {
  title: "HIHONG RECRUIT",
  description: "구직자와 기업을 연결하는 하이홍 채용 플랫폼",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HIHONG RECRUIT",
  },
};

export const viewport: Viewport = {
  themeColor: "#e86a2e",
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
