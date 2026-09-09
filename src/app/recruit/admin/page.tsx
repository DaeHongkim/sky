import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { requirePageUser } from "@/lib/auth/page-guard";
import Card from "@/components/recruit/ui/Card";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  await requirePageUser(["ADMIN"]);

  const [totalUsers, seekerCount, companyCount, pendingCompanies, openJobs, applications, pendingVisa] =
    await Promise.all([
      prisma.user.count({ where: { status: "ACTIVE" } }),
      prisma.user.count({ where: { role: "JOB_SEEKER", status: "ACTIVE" } }),
      prisma.user.count({ where: { role: "COMPANY", status: "ACTIVE" } }),
      prisma.companyProfile.count({ where: { verificationStatus: "PENDING" } }),
      prisma.jobPost.count({ where: { status: "OPEN" } }),
      prisma.application.count(),
      prisma.visaProfile.count({ where: { verificationStatus: { not: "ADMIN_VERIFIED" } } }),
    ]);

  const stats = [
    { label: "전체 활성회원", value: totalUsers, href: "/recruit/admin/users" },
    { label: "구직자", value: seekerCount, href: "/recruit/admin/users?role=JOB_SEEKER" },
    { label: "기업회원", value: companyCount, href: "/recruit/admin/users?role=COMPANY" },
    { label: "기업인증 대기", value: pendingCompanies, href: "/recruit/admin/companies" },
    { label: "진행중 공고", value: openJobs },
    { label: "누적 지원", value: applications },
    { label: "비자 검토대기", value: pendingVisa, href: "/recruit/admin/visa" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-slate-900">관리자 대시보드</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => {
          const content = (
            <Card key={s.label} className="text-center transition-shadow hover:shadow-md">
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="mt-1 text-xs text-slate-500">{s.label}</p>
            </Card>
          );
          return s.href ? (
            <Link key={s.label} href={s.href}>
              {content}
            </Link>
          ) : (
            content
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/recruit/admin/users" className="font-medium text-slate-900 underline">
          회원 관리 →
        </Link>
        <Link href="/recruit/admin/companies" className="font-medium text-slate-900 underline">
          기업 인증 관리 →
        </Link>
        <Link href="/recruit/admin/visa" className="font-medium text-slate-900 underline">
          비자 검토 →
        </Link>
        <Link href="/recruit/admin/audit-logs" className="font-medium text-slate-900 underline">
          Audit Log →
        </Link>
      </div>
    </div>
  );
}
