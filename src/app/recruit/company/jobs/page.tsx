import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { requirePageUser } from "@/lib/auth/page-guard";
import Card from "@/components/recruit/ui/Card";
import Badge from "@/components/recruit/ui/Badge";
import EmptyState from "@/components/recruit/ui/EmptyState";
import JobActions from "@/components/recruit/JobActions";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  DRAFT: "임시저장",
  OPEN: "게시중",
  CLOSED: "마감",
  EXPIRED: "기간만료",
};
const statusTone: Record<string, "neutral" | "success" | "warning" | "danger"> = {
  DRAFT: "neutral",
  OPEN: "success",
  CLOSED: "warning",
  EXPIRED: "danger",
};

export default async function CompanyJobsPage() {
  const user = await requirePageUser(["COMPANY"]);
  const jobs = await prisma.jobPost.findMany({
    where: { companyId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">채용공고 관리</h1>
        <Link
          href="/recruit/company/jobs/new"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          + 새 공고
        </Link>
      </div>

      {jobs.length === 0 ? (
        <EmptyState title="등록된 채용공고가 없습니다." description="첫 채용공고를 등록해보세요." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {jobs.map((job) => (
            <Card key={job.id}>
              <div className="flex items-start justify-between gap-2">
                <Link
                  href={`/recruit/company/jobs/${job.id}`}
                  className="font-semibold text-slate-900 hover:underline"
                >
                  {job.title}
                </Link>
                <Badge tone={statusTone[job.status]}>{statusLabel[job.status]}</Badge>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {job.workLocation} · 조회 {job.views}
              </p>
              <JobActions jobId={job.id} status={job.status} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
