import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { requirePageUser } from "@/lib/auth/page-guard";
import Card from "@/components/recruit/ui/Card";
import Badge from "@/components/recruit/ui/Badge";
import EmptyState from "@/components/recruit/ui/EmptyState";
import WithdrawButton from "@/components/recruit/WithdrawButton";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  APPLIED: "지원완료",
  DOCUMENT_REVIEW: "서류검토중",
  INTERVIEW_REQUESTED: "면접요청",
  INTERVIEW_SCHEDULED: "면접확정",
  INTERVIEW_COMPLETED: "면접완료",
  OFFER: "오퍼제안",
  HIRED: "채용확정",
  REJECTED: "불합격",
  WITHDRAWN: "지원취소",
};
const statusTone: Record<string, "neutral" | "success" | "warning" | "danger" | "info"> = {
  APPLIED: "info",
  DOCUMENT_REVIEW: "info",
  INTERVIEW_REQUESTED: "warning",
  INTERVIEW_SCHEDULED: "warning",
  INTERVIEW_COMPLETED: "warning",
  OFFER: "success",
  HIRED: "success",
  REJECTED: "danger",
  WITHDRAWN: "neutral",
};

export default async function SeekerApplicationsPage() {
  const user = await requirePageUser(["JOB_SEEKER"]);
  const applications = await prisma.application.findMany({
    where: { jobSeekerId: user.id },
    orderBy: { appliedAt: "desc" },
    include: {
      jobPost: { select: { id: true, title: true, workLocation: true } },
      resume: { select: { title: true } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-slate-900">지원현황</h1>
      {applications.length === 0 ? (
        <EmptyState title="지원한 공고가 없습니다." description="채용공고를 둘러보고 지원해보세요." />
      ) : (
        <div className="flex flex-col gap-3">
          {applications.map((app) => (
            <Card key={app.id}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Link
                    href={`/recruit/jobs/${app.jobPost.id}`}
                    className="font-semibold text-slate-900 hover:underline"
                  >
                    {app.jobPost.title}
                  </Link>
                  <p className="mt-1 text-sm text-slate-500">
                    {app.jobPost.workLocation} · {app.resume.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    지원일: {app.appliedAt.toLocaleDateString("ko-KR")}
                  </p>
                </div>
                <Badge tone={statusTone[app.status]}>{statusLabel[app.status]}</Badge>
              </div>
              {!["HIRED", "REJECTED", "WITHDRAWN"].includes(app.status) && (
                <div className="mt-3">
                  <WithdrawButton applicationId={app.id} />
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
