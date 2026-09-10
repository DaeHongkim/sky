import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { requirePageUser } from "@/lib/auth/page-guard";
import Card from "@/components/recruit/ui/Card";
import Badge from "@/components/recruit/ui/Badge";
import EmptyState from "@/components/recruit/ui/EmptyState";
import CreateContractButton from "@/components/recruit/CreateContractButton";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  PENDING: "응답대기",
  ACCEPTED: "수락함",
  DECLINED: "거절함",
  EXPIRED: "만료됨",
};
const statusTone: Record<string, "neutral" | "success" | "warning" | "danger" | "info"> = {
  PENDING: "warning",
  ACCEPTED: "success",
  DECLINED: "neutral",
  EXPIRED: "danger",
};

export default async function CompanyOffersPage() {
  const user = await requirePageUser(["COMPANY"]);
  const offers = await prisma.jobOffer.findMany({
    where: { companyId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      application: { include: { jobPost: { select: { title: true } } } },
      jobSeeker: { select: { jobSeekerProfile: { select: { name: true } } } },
      contracts: { orderBy: { version: "desc" }, take: 1 },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-slate-900">Offer 관리</h1>
      {offers.length === 0 ? (
        <EmptyState title="발송한 Offer가 없습니다." />
      ) : (
        <div className="flex flex-col gap-3">
          {offers.map((offer) => (
            <Card key={offer.id}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900">
                    {offer.jobSeeker.jobSeekerProfile?.name ?? "지원자"}
                  </p>
                  <p className="text-sm text-slate-500">{offer.application.jobPost.title}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    급여 {offer.salary.toLocaleString()}원 · {offer.workLocation}
                  </p>
                </div>
                <Badge tone={statusTone[offer.status]}>{statusLabel[offer.status]}</Badge>
              </div>
              {offer.status === "ACCEPTED" &&
                (offer.contracts[0] ? (
                  <Link
                    href={`/recruit/company/contracts/${offer.contracts[0].id}`}
                    className="mt-3 inline-block text-sm font-medium text-slate-900 underline"
                  >
                    계약서 관리 →
                  </Link>
                ) : (
                  <CreateContractButton jobOfferId={offer.id} />
                ))}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
