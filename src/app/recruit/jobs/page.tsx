import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import Card from "@/components/recruit/ui/Card";
import Badge from "@/components/recruit/ui/Badge";
import Input from "@/components/recruit/ui/Input";
import EmptyState from "@/components/recruit/ui/EmptyState";

export const dynamic = "force-dynamic";

const employmentTypeLabel: Record<string, string> = {
  FULL_TIME: "정규직",
  PART_TIME: "파트타임",
  CONTRACT: "계약직",
  DAILY: "일용직",
  INTERNSHIP: "인턴",
  FREELANCE: "프리랜서",
};

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const keyword = q?.trim();

  const jobs = await prisma.jobPost.findMany({
    where: {
      status: "OPEN",
      ...(keyword
        ? {
            OR: [
              { title: { contains: keyword, mode: "insensitive" } },
              { jobCategory: { contains: keyword, mode: "insensitive" } },
              { workLocation: { contains: keyword, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { company: { select: { companyName: true } } },
    take: 50,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">채용공고</h1>
        <form className="mt-3">
          <Input
            id="q"
            name="q"
            placeholder="직종, 지역, 키워드로 검색"
            defaultValue={keyword}
          />
        </form>
      </div>

      {jobs.length === 0 ? (
        <EmptyState
          title="조건에 맞는 채용공고가 없습니다."
          description="다른 키워드로 검색해보세요."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <Link key={job.id} href={`/recruit/jobs/${job.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-slate-900">{job.title}</p>
                  {job.foreignerAllowed && <Badge tone="info">외국인가능</Badge>}
                </div>
                <p className="mt-1 text-sm text-slate-500">{job.company.companyName}</p>
                <p className="mt-2 text-sm text-slate-600">
                  {job.workLocation} · {employmentTypeLabel[job.employmentType]}
                </p>
                {(job.salaryMin || job.salaryMax) && (
                  <p className="mt-1 text-sm text-slate-600">
                    {job.salaryMin?.toLocaleString()} ~ {job.salaryMax?.toLocaleString()}원
                  </p>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
