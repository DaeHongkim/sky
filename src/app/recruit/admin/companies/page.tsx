import { prisma } from "@/lib/db/prisma";
import { requirePageUser } from "@/lib/auth/page-guard";
import Card from "@/components/recruit/ui/Card";
import Badge from "@/components/recruit/ui/Badge";
import EmptyState from "@/components/recruit/ui/EmptyState";
import CompanyVerifyControl from "@/components/recruit/CompanyVerifyControl";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  PENDING: "인증대기",
  VERIFIED: "인증완료",
  REJECTED: "인증거절",
};
const statusTone: Record<string, "warning" | "success" | "danger"> = {
  PENDING: "warning",
  VERIFIED: "success",
  REJECTED: "danger",
};

export default async function AdminCompaniesPage() {
  await requirePageUser(["ADMIN"]);

  const companies = await prisma.companyProfile.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { email: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-slate-900">기업 인증 관리</h1>
      {companies.length === 0 ? (
        <EmptyState title="등록된 기업이 없습니다." />
      ) : (
        <div className="flex flex-col gap-3">
          {companies.map((c) => (
            <Card key={c.userId}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900">{c.companyName}</p>
                  <p className="text-sm text-slate-500">
                    {c.user.email} · 사업자번호 {c.businessRegistrationNumber}
                  </p>
                  <p className="text-xs text-slate-400">담당자: {c.contactName} ({c.contactPhone})</p>
                </div>
                <Badge tone={statusTone[c.verificationStatus]}>
                  {statusLabel[c.verificationStatus]}
                </Badge>
              </div>
              <CompanyVerifyControl userId={c.userId} currentStatus={c.verificationStatus} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
