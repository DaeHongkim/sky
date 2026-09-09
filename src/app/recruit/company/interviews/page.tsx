import { prisma } from "@/lib/db/prisma";
import { requirePageUser } from "@/lib/auth/page-guard";
import Card from "@/components/recruit/ui/Card";
import Badge from "@/components/recruit/ui/Badge";
import EmptyState from "@/components/recruit/ui/EmptyState";
import InterviewStatusControl from "@/components/recruit/InterviewStatusControl";

export const dynamic = "force-dynamic";

const typeLabel: Record<string, string> = {
  ONLINE: "화상면접",
  OFFLINE: "대면면접",
  PHONE: "전화면접",
  AI_PRESCREEN: "AI 사전면접",
};
const statusLabel: Record<string, string> = {
  REQUESTED: "응답대기",
  CONFIRMED: "확정",
  COMPLETED: "완료",
  CANCELLED: "취소됨",
  NO_SHOW: "불참",
};
const statusTone: Record<string, "neutral" | "success" | "warning" | "danger" | "info"> = {
  REQUESTED: "warning",
  CONFIRMED: "success",
  COMPLETED: "info",
  CANCELLED: "neutral",
  NO_SHOW: "danger",
};

export default async function CompanyInterviewsPage() {
  const user = await requirePageUser(["COMPANY"]);
  const interviews = await prisma.interview.findMany({
    where: { companyId: user.id },
    orderBy: { scheduledAt: "asc" },
    include: {
      application: { include: { jobPost: { select: { title: true } } } },
      jobSeeker: { select: { jobSeekerProfile: { select: { name: true } } } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-slate-900">면접 관리</h1>
      {interviews.length === 0 ? (
        <EmptyState title="등록된 면접이 없습니다." />
      ) : (
        <div className="flex flex-col gap-3">
          {interviews.map((iv) => (
            <Card key={iv.id}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900">
                    {iv.jobSeeker.jobSeekerProfile?.name ?? "지원자"}
                  </p>
                  <p className="text-sm text-slate-500">{iv.application.jobPost.title}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {typeLabel[iv.interviewType]} · {iv.scheduledAt?.toLocaleString("ko-KR")}
                  </p>
                </div>
                <Badge tone={statusTone[iv.status]}>{statusLabel[iv.status]}</Badge>
              </div>
              <InterviewStatusControl
                interviewId={iv.id}
                actions={
                  iv.status === "REQUESTED"
                    ? [{ status: "CANCELLED", label: "요청 취소", variant: "danger" }]
                    : iv.status === "CONFIRMED"
                    ? [
                        { status: "COMPLETED", label: "완료 처리", variant: "primary" },
                        { status: "NO_SHOW", label: "불참 처리", variant: "danger" },
                        { status: "CANCELLED", label: "취소", variant: "secondary" },
                      ]
                    : []
                }
              />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
