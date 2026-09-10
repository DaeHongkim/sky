import type { Metadata, Viewport } from "next";
import { getCurrentUser } from "@/lib/auth/current-user";
import { RecruitHeader, RecruitBottomNav } from "@/components/recruit/RecruitChrome";
import PwaRegister from "@/components/recruit/PwaRegister";

export const metadata: Metadata = {
  title: "HIHONG RECRUIT",
  description: "구직자와 기업을 위한 채용 플랫폼",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HIHONG RECRUIT",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
};

export default async function RecruitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-slate-50 pb-16 text-slate-900 md:pb-0">
      <RecruitHeader user={user} />
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      <RecruitBottomNav role={user?.role ?? null} />
      <PwaRegister />
    </div>
  );
}
