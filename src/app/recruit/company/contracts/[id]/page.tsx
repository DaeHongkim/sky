import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requirePageUser } from "@/lib/auth/page-guard";
import Card from "@/components/recruit/ui/Card";
import Badge from "@/components/recruit/ui/Badge";
import ContractCompanyActions from "@/components/recruit/ContractCompanyActions";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  DRAFT: "임시저장",
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

export default async function CompanyContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePageUser(["COMPANY"]);
  const { id } = await params;

  const contract = await prisma.employmentContract.findUnique({
    where: { id },
    include: { jobSeeker: { select: { jobSeekerProfile: { select: { name: true } } } } },
  });
  if (!contract || contract.companyId !== user.id) notFound();

  const versions = await prisma.employmentContract.findMany({
    where: { contractGroupId: contract.contractGroupId },
    orderBy: { version: "desc" },
  });

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900">전자근로계약서</h1>
          <p className="mt-1 text-sm text-slate-500">
            {contract.jobSeeker.jobSeekerProfile?.name ?? "지원자"} · V{contract.version}
          </p>
        </div>
        <Badge tone={statusTone[contract.status]}>{statusLabel[contract.status]}</Badge>
      </div>

      <Card>
        <p className="whitespace-pre-wrap text-sm text-slate-700">{contract.contentOriginal}</p>
      </Card>

      {contract.status === "SIGNED" && (
        <Card className="bg-emerald-50 text-sm text-emerald-800">
          <p>서명시간: {contract.signedAt?.toLocaleString("ko-KR")}</p>
          <p className="mt-1 break-all">signature hash: {contract.signatureHash}</p>
          <p className="mt-1 break-all">integrity hash: {contract.integrityHash}</p>
        </Card>
      )}

      <ContractCompanyActions
        contractId={contract.id}
        status={contract.status}
        contentOriginal={contract.contentOriginal}
      />

      {versions.length > 1 && (
        <Card>
          <h2 className="mb-2 font-semibold text-slate-900">버전 이력</h2>
          <ul className="flex flex-col gap-1 text-sm text-slate-600">
            {versions.map((v) => (
              <li key={v.id}>
                V{v.version} · {statusLabel[v.status]} · {v.createdAt.toLocaleDateString("ko-KR")}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
