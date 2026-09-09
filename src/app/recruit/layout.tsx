import type { Metadata } from "next";
import "./recruit.css";
import { RecruitChrome, RecruitProviders } from "@/components/recruit/RecruitShell";
import PwaRegister from "@/components/recruit/PwaRegister";

export const metadata: Metadata = {
  title: "HIHONG RECRUIT",
  description: "구직자와 기업을 위한 하이홍 채용 플랫폼",
  manifest: "/recruit-manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HIHONG RECRUIT",
  },
};

export default function RecruitLayout({ children }: { children: React.ReactNode }) {
  return (
    <RecruitProviders>
      <RecruitChrome>{children}</RecruitChrome>
      <PwaRegister />
    </RecruitProviders>
  );
}
