import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { requirePageUser } from "@/lib/auth/page-guard";
import Card from "@/components/recruit/ui/Card";
import Badge from "@/components/recruit/ui/Badge";

export const dynamic = "force-dynamic";

const verificationTone = {
  PENDING: "warning",
  VERIFIED: "success",
  REJECTED: "danger",
} as const;

const verificationLabel = {
  PENDING: "인증대기",
  VERIFIED: "인증완료",
  REJECTED: "인증거절",
} as const;

export default async function CompanyMyPage() {
  const user = await requirePageUser(["COMPANY"]);

  const profile = await prisma.companyProfile.findUnique({ where: { userId: user.id } });

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [openJobs, todayApplicants, newApplicants, interviewsUpcoming, hiredCount, closingSoon] =
    await Promise.all([
      prisma.jobPost.count({ where: { companyId: user.id, status: "OPEN" } }),
      prisma.application.count({
        where: { companyId: user.id, appliedAt: { gte: todayStart } },
      }),
      prisma.application.count({
        where: { companyId: user.id, status: "APPLIED" },
      }),
      prisma.interview.count({
        where: {
          companyId: user.id,
          status: { in: ["REQUESTED", "CONFIRMED"] },
        },
      }),
      prisma.application.count({ where: { companyId: user.id, status: "HIRED" } }),
      prisma.jobPost.count({
        where: {
          companyId: user.id,
          status: "OPEN",
          deadline: {
            gte: now,
            lte: sevenDaysLater,
          },
        },
      }),
    ]);

  const recentApplicants = await prisma.application.findMany({
    where: { companyId: user.id },
    orderBy: { appliedAt: "desc" },
    take: 5,
    include: {
      jobSeeker: { include: { jobSeekerProfile: { select: { name: true } } } },
      jobPost: { select: { title: true } },
    },
  });

  const stats = [
    { label: "진행중 공고", value: openJobs, href: "/recruit/company/jobs" },
    { label: "오늘 지원자", value: todayApplicants, href: "/recruit/company/applicants" },
    { label: "신규 지원자", value: newApplicants, href: "/recruit/company/applicants" },
    { label: "면접예정", value: interviewsUpcoming, href: "/recruit/company/interviews" },
    { label: "채용확정", value: hiredCount, href: "/recruit/company/applicants" },
    { label: "마감임박(7일)", value: closingSoon, href: "/recruit/company/jobs" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {profile?.companyName ?? user.email}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{user.email}</p>
        </div>
        {profile && (
          <Badge tone={verificationTone[profile.verificationStatus]}>
            {verificationLabel[profile.verificationStatus]}
          </Badge>
        )}
      </div>

      {profile?.verificationStatus === "PENDING" && (
        <Card className="border-amber-300 bg-amber-50">
          <p className="text-sm text-amber-800">
            기업 인증 대기 중입니다. 관리자 인증 완료 후 채용공고를 게시할 수 있습니다.
          </p>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="text-center transition-shadow hover:shadow-md">
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="mt-1 text-xs text-slate-500">{s.label}</p>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">최근 지원자</h2>
          <Link href="/recruit/company/applicants" className="text-sm text-slate-500 underline">
            전체보기
          </Link>
        </div>
        {recentApplicants.length === 0 ? (
          <p className="text-sm text-slate-500">아직 지원자가 없습니다.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recentApplicants.map((app) => (
              <li key={app.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <p className="font-medium text-slate-900">
                    {app.jobSeeker.jobSeekerProfile?.name ?? "지원자"}
                  </p>
                  <p className="text-slate-500">{app.jobPost.title}</p>
                </div>
                <Badge tone="neutral">{app.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/recruit/company/offers" className="font-medium text-slate-900 underline">
          Offer 관리 →
        </Link>
      </div>

      <Link
        href="/recruit/company/jobs/new"
        className="rounded-lg bg-slate-900 px-4 py-3 text-center text-sm font-medium text-white hover:bg-slate-800"
      >
        + 새 채용공고 등록
      </Link>
    </div>
  );
}
