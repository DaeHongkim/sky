import { prisma } from "@/lib/db/prisma";
import { requirePageUser } from "@/lib/auth/page-guard";
import Card from "@/components/recruit/ui/Card";
import Badge from "@/components/recruit/ui/Badge";
import EmptyState from "@/components/recruit/ui/EmptyState";
import ReportReviewControl from "@/components/recruit/ReportReviewControl";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  PENDING: "대기중",
  REVIEWED: "처리완료",
  DISMISSED: "기각",
};
const statusTone: Record<string, "warning" | "success" | "neutral"> = {
  PENDING: "warning",
  REVIEWED: "success",
  DISMISSED: "neutral",
};

export default async function AdminReportsPage() {
  await requirePageUser(["ADMIN"]);

  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { reporter: { select: { email: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-slate-900">신고 관리</h1>
      {reports.length === 0 ? (
        <EmptyState title="접수된 신고가 없습니다." />
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map((r) => (
            <Card key={r.id}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900">
                    {r.targetType} · {r.targetId}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{r.reason}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    신고자: {r.reporter.email} · {r.createdAt.toLocaleString("ko-KR")}
                  </p>
                </div>
                <Badge tone={statusTone[r.status]}>{statusLabel[r.status]}</Badge>
              </div>
              {r.status === "PENDING" && <ReportReviewControl reportId={r.id} />}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
