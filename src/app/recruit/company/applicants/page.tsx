import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { requirePageUser } from "@/lib/auth/page-guard";
import Card from "@/components/recruit/ui/Card";
import Badge from "@/components/recruit/ui/Badge";
import EmptyState from "@/components/recruit/ui/EmptyState";
import ApplicantStatusControl from "@/components/recruit/ApplicantStatusControl";
import InterviewRequestForm from "@/components/recruit/InterviewRequestForm";
import OfferForm from "@/components/recruit/OfferForm";

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

export default async function CompanyApplicantsPage({
  searchParams,
}: {
  searchParams: Promise<{ jobPostId?: string }>;
}) {
  const user = await requirePageUser(["COMPANY"]);
  const { jobPostId } = await searchParams;

  const [applications, jobPosts] = await Promise.all([
    prisma.application.findMany({
      where: { companyId: user.id, ...(jobPostId ? { jobPostId } : {}) },
      orderBy: { appliedAt: "desc" },
      include: {
        jobPost: { select: { id: true, title: true } },
        resume: { select: { id: true, title: true } },
        jobSeeker: { include: { jobSeekerProfile: { select: { name: true, phone: true } } } },
      },
    }),
    prisma.jobPost.findMany({
      where: { companyId: user.id },
      select: { id: true, title: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-slate-900">지원자 관리</h1>

      <div className="flex flex-wrap gap-2">
        <Link href="/recruit/company/applicants">
          <Badge tone={!jobPostId ? "info" : "neutral"}>전체</Badge>
        </Link>
        {jobPosts.map((jp) => (
          <Link key={jp.id} href={`/recruit/company/applicants?jobPostId=${jp.id}`}>
            <Badge tone={jobPostId === jp.id ? "info" : "neutral"}>{jp.title}</Badge>
          </Link>
        ))}
      </div>

      {applications.length === 0 ? (
        <EmptyState title="지원자가 없습니다." />
      ) : (
        <div className="flex flex-col gap-3">
          {applications.map((app) => (
            <Card key={app.id}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">
                    {app.jobSeeker.jobSeekerProfile?.name ?? "지원자"}
                  </p>
                  <p className="text-sm text-slate-500">{app.jobPost.title}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    지원일: {app.appliedAt.toLocaleDateString("ko-KR")} · {app.resume.title}
                  </p>
                </div>
                <Badge tone="neutral">{statusLabel[app.status]}</Badge>
              </div>
              <div className="mt-3">
                <ApplicantStatusControl
                  applicationId={app.id}
                  currentStatus={app.status}
                  currentMemo={app.companyMemo ?? ""}
                />
              </div>
              {!["HIRED", "REJECTED", "WITHDRAWN"].includes(app.status) && (
                <div className="flex flex-wrap gap-2">
                  <InterviewRequestForm applicationId={app.id} />
                  <OfferForm applicationId={app.id} />
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
