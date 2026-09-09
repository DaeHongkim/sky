import { prisma } from "@/lib/db/prisma";
import { requirePageUser } from "@/lib/auth/page-guard";
import Card from "@/components/recruit/ui/Card";
import Badge from "@/components/recruit/ui/Badge";
import EmptyState from "@/components/recruit/ui/EmptyState";
import ScoutRespondButtons from "@/components/recruit/ScoutRespondButtons";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  PENDING: "확인전",
  OPENED: "열람함",
  ACCEPTED: "수락함",
  DECLINED: "거절함",
  EXPIRED: "만료됨",
};
const statusTone: Record<string, "neutral" | "success" | "warning" | "danger" | "info"> = {
  PENDING: "info",
  OPENED: "warning",
  ACCEPTED: "success",
  DECLINED: "neutral",
  EXPIRED: "danger",
};

export default async function SeekerScoutsPage() {
  const user = await requirePageUser(["JOB_SEEKER"]);

  const offers = await prisma.scoutOffer.findMany({
    where: { jobSeekerId: user.id },
    orderBy: { createdAt: "desc" },
    include: { company: { select: { companyName: true } } },
  });

  // 최초 조회 시 PENDING → OPENED 로 전환한다.
  const pendingIds = offers.filter((o) => o.status === "PENDING").map((o) => o.id);
  if (pendingIds.length > 0) {
    await prisma.scoutOffer.updateMany({
      where: { id: { in: pendingIds } },
      data: { status: "OPENED" },
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-slate-900">스카우트 제안</h1>
      {offers.length === 0 ? (
        <EmptyState title="받은 스카우트 제안이 없습니다." />
      ) : (
        <div className="flex flex-col gap-3">
          {offers.map((offer) => {
            const status = pendingIds.includes(offer.id) ? "OPENED" : offer.status;
            return (
              <Card key={offer.id}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">{offer.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{offer.company.companyName}</p>
                  </div>
                  <Badge tone={statusTone[status]}>{statusLabel[status]}</Badge>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{offer.message}</p>
                {(status === "PENDING" || status === "OPENED") && (
                  <ScoutRespondButtons offerId={offer.id} />
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
