import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requirePageUser } from "@/lib/auth/page-guard";
import Card from "@/components/recruit/ui/Card";
import Badge from "@/components/recruit/ui/Badge";
import ContractSeekerActions from "@/components/recruit/ContractSeekerActions";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  DRAFT: "작성중",
  SENT: "발송됨",
  VIEWED: "열람함",
  AGREED: "동의함",
  SIGNED: "서명완료",
  CANCELLED: "취소됨",
};
const statusTone: Record<string, "neutral" | "success" | "warning" | "danger" | "info"> = {
  DRAFT: "neutral",
  SENT: "info",
  VIEWED: "info",
  AGREED: "warning",
  SIGNED: "success",
  CANCELLED: "danger",
};

export default async function SeekerContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePageUser(["JOB_SEEKER"]);
  const { id } = await params;

  const contract = await prisma.employmentContract.findUnique({
    where: { id },
    include: { company: { select: { companyName: true } } },
  });
  if (!contract || contract.jobSeekerId !== user.id) notFound();

  // 구직자가 처음 열람하는 시점에 SENT → VIEWED 로 전환한다.
  let current = contract;
  if (contract.status === "SENT") {
    current = await prisma.employmentContract.update({
      where: { id },
      data: { status: "VIEWED", viewedAt: new Date() },
      include: { company: { select: { companyName: true } } },
    });
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900">전자근로계약서</h1>
          <p className="mt-1 text-sm text-slate-500">
            {current.company.companyName} · V{current.version}
          </p>
        </div>
        <Badge tone={statusTone[current.status]}>{statusLabel[current.status]}</Badge>
      </div>

      <Card>
        <p className="whitespace-pre-wrap text-sm text-slate-700">{current.contentOriginal}</p>
      </Card>

      {current.status === "SIGNED" && (
        <Card className="bg-emerald-50 text-sm text-emerald-800">
          <p>서명시간: {current.signedAt?.toLocaleString("ko-KR")}</p>
          <p className="mt-1">채용이 확정되었습니다.</p>
        </Card>
      )}

      <ContractSeekerActions contractId={current.id} status={current.status} />
    </div>
  );
}
