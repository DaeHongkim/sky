import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { requirePageUser } from "@/lib/auth/page-guard";
import Card from "@/components/recruit/ui/Card";
import Badge from "@/components/recruit/ui/Badge";

export const dynamic = "force-dynamic";

export default async function SeekerMyPage() {
  const user = await requirePageUser(["JOB_SEEKER"]);

  const [profile, resumeCount, applicationCount, scrapCount, unreadNotifications, scoutCount, interviewCount] =
    await Promise.all([
      prisma.jobSeekerProfile.findUnique({ where: { userId: user.id } }),
      prisma.resume.count({ where: { userId: user.id } }),
      prisma.application.count({ where: { jobSeekerId: user.id } }),
      prisma.jobScrap.count({ where: { jobSeekerId: user.id } }),
      prisma.notification.count({ where: { userId: user.id, isRead: false } }),
      prisma.scoutOffer.count({
        where: { jobSeekerId: user.id, status: { in: ["PENDING", "OPENED"] } },
      }),
      prisma.interview.count({
        where: { jobSeekerId: user.id, status: { in: ["REQUESTED", "CONFIRMED"] } },
      }),
    ]);

  const stats = [
    { label: "이력서", value: resumeCount, href: "/recruit/seeker/resumes" },
    { label: "지원현황", value: applicationCount, href: "/recruit/seeker/applications" },
    { label: "면접", value: interviewCount, href: "/recruit/seeker/interviews" },
    { label: "스크랩", value: scrapCount, href: "/recruit/seeker/scraps" },
    { label: "스카우트", value: scoutCount, href: "/recruit/seeker/scouts" },
    { label: "안읽은 알림", value: unreadNotifications, href: "/recruit/notifications" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{profile?.name ?? user.email}님</h1>
          <p className="mt-1 text-sm text-slate-500">{user.email}</p>
        </div>
        <Badge tone="neutral">구직자</Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="text-center transition-shadow hover:shadow-md">
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="mt-1 text-sm text-slate-500">{s.label}</p>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <h2 className="font-semibold text-slate-900">프로필</h2>
        <p className="mt-1 text-sm text-slate-500">
          {profile
            ? "기본 프로필이 등록되어 있습니다."
            : "프로필을 아직 작성하지 않았습니다."}
        </p>
        <div className="mt-3 flex gap-4">
          <Link
            href="/recruit/seeker/profile"
            className="text-sm font-medium text-slate-900 underline"
          >
            프로필 관리 →
          </Link>
          <Link
            href="/recruit/seeker/visa"
            className="text-sm font-medium text-slate-900 underline"
          >
            비자/체류 정보 →
          </Link>
        </div>
      </Card>
    </div>
  );
}
