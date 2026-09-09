import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";
import Card from "@/components/recruit/ui/Card";
import Badge from "@/components/recruit/ui/Badge";
import ApplyPanel from "@/components/recruit/ApplyPanel";

export const dynamic = "force-dynamic";

const employmentTypeLabel: Record<string, string> = {
  FULL_TIME: "정규직",
  PART_TIME: "파트타임",
  CONTRACT: "계약직",
  DAILY: "일용직",
  INTERNSHIP: "인턴",
  FREELANCE: "프리랜서",
};

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [job, user] = await Promise.all([
    prisma.jobPost.findUnique({
      where: { id },
      include: { company: true },
    }),
    getCurrentUser(),
  ]);

  if (!job || (job.status !== "OPEN" && user?.role !== "COMPANY" && user?.role !== "ADMIN")) {
    notFound();
  }

  // 조회수는 write이므로 여기서 fire-and-forget으로 늘리되 렌더링을 막지 않는다.
  void prisma.jobPost.update({ where: { id }, data: { views: { increment: 1 } } }).catch(() => {});

  const existingApplication =
    user?.role === "JOB_SEEKER"
      ? await prisma.application.findFirst({
          where: { jobPostId: id, jobSeekerId: user.id, status: { not: "WITHDRAWN" } },
        })
      : null;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-xl font-bold text-slate-900">{job.title}</h1>
          {job.foreignerAllowed && <Badge tone="info">외국인가능</Badge>}
        </div>
        <p className="mt-1 text-slate-500">{job.company.companyName}</p>
      </div>

      <Card className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-slate-500">근무지</p>
          <p className="font-medium text-slate-900">{job.workLocation}</p>
        </div>
        <div>
          <p className="text-slate-500">고용형태</p>
          <p className="font-medium text-slate-900">
            {employmentTypeLabel[job.employmentType]}
          </p>
        </div>
        {(job.salaryMin || job.salaryMax) && (
          <div>
            <p className="text-slate-500">급여</p>
            <p className="font-medium text-slate-900">
              {job.salaryMin?.toLocaleString()} ~ {job.salaryMax?.toLocaleString()}원 (
              {job.salaryType})
            </p>
          </div>
        )}
        {job.deadline && (
          <div>
            <p className="text-slate-500">마감일</p>
            <p className="font-medium text-slate-900">
              {job.deadline.toLocaleDateString("ko-KR")}
            </p>
          </div>
        )}
        {job.koreanLevel && (
          <div>
            <p className="text-slate-500">한국어 수준</p>
            <p className="font-medium text-slate-900">{job.koreanLevel}</p>
          </div>
        )}
        <div>
          <p className="text-slate-500">조회수</p>
          <p className="font-medium text-slate-900">{job.views + 1}</p>
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-slate-900">상세 내용</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{job.description}</p>
        {job.requirements && (
          <>
            <h3 className="mt-4 font-medium text-slate-900">지원자격</h3>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{job.requirements}</p>
          </>
        )}
      </Card>

      <div className="flex flex-wrap gap-2">
        {job.housingSupport && <Badge tone="success">숙소제공</Badge>}
        {job.mealSupport && <Badge tone="success">식사제공</Badge>}
        {job.transportationSupport && <Badge tone="success">교통비지원</Badge>}
      </div>

      {job.status === "OPEN" &&
        (!user ? (
          <div className="rounded-lg border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500">
            지원하려면 먼저{" "}
            <Link href="/recruit/login" className="font-medium text-slate-900 underline">
              로그인
            </Link>
            하세요.
          </div>
        ) : user.role === "JOB_SEEKER" ? (
          existingApplication ? (
            <p className="rounded-lg bg-slate-100 p-3 text-center text-sm text-slate-600">
              이미 지원한 공고입니다. (상태: {existingApplication.status})
            </p>
          ) : (
            <ApplyPanel jobPostId={job.id} />
          )
        ) : null)}
    </div>
  );
}
