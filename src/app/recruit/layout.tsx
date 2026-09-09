import { getCurrentUser } from "@/lib/auth/current-user";
import { RecruitHeader, RecruitBottomNav } from "@/components/recruit/RecruitChrome";

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
    </div>
  );
}
