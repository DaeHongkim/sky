import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";
import Card from "@/components/recruit/ui/Card";
import Badge from "@/components/recruit/ui/Badge";
import Button from "@/components/recruit/ui/Button";
import EmptyState from "@/components/recruit/ui/EmptyState";

export const dynamic = "force-dynamic";

export default async function RecruitHomePage() {
  const [user, latestJobs] = await Promise.all([
    getCurrentUser(),
    prisma.jobPost.findMany({
      where: { status: "OPEN" },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { company: { select: { companyName: true, verificationStatus: true } } },
    }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-2xl bg-slate-900 px-6 py-10 text-white">
        <h1 className="text-2xl font-bold sm:text-3xl">HIHONG RECRUIT</h1>
        <p className="mt-2 text-slate-300">
          구직자와 기업을 위한 채용 플랫폼 — 이력서 작성부터 지원, 면접, 근로계약까지.
        </p>
        {!user && (
          <div className="mt-5 flex gap-3">
            <Link href="/recruit/signup">
              <Button variant="primary" className="bg-white text-slate-900 hover:bg-slate-100">
                지금 시작하기
              </Button>
            </Link>
            <Link href="/recruit/jobs">
              <Button variant="secondary" className="border-white/40 bg-transparent text-white hover:bg-white/10">
                채용공고 둘러보기
              </Button>
            </Link>
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">최신 채용공고</h2>
          <Link href="/recruit/jobs" className="text-sm text-slate-500 underline">
            전체보기
          </Link>
        </div>

        {latestJobs.length === 0 ? (
          <EmptyState
            title="아직 게시된 채용공고가 없습니다."
            description="기업회원으로 가입 후 첫 채용공고를 등록해보세요."
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {latestJobs.map((job) => (
              <Link key={job.id} href={`/recruit/jobs/${job.id}`}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-slate-900">{job.title}</p>
                    {job.foreignerAllowed && <Badge tone="info">외국인가능</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{job.company.companyName}</p>
                  <p className="mt-2 text-sm text-slate-600">{job.workLocation}</p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
