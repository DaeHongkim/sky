import { prisma } from "@/lib/db/prisma";
import { requirePageUser } from "@/lib/auth/page-guard";
import Card from "@/components/recruit/ui/Card";
import Badge from "@/components/recruit/ui/Badge";
import EmptyState from "@/components/recruit/ui/EmptyState";
import VisaVerifyControl from "@/components/recruit/VisaVerifyControl";

export const dynamic = "force-dynamic";

const verificationLabel: Record<string, string> = {
  AI_ESTIMATED: "AI 예상",
  NEEDS_OFFICIAL_CHECK: "공식 확인 필요",
  ADMIN_VERIFIED: "관리자 확인 완료",
};
const verificationTone: Record<string, "warning" | "danger" | "success"> = {
  AI_ESTIMATED: "warning",
  NEEDS_OFFICIAL_CHECK: "danger",
  ADMIN_VERIFIED: "success",
};

export default async function AdminVisaPage() {
  await requirePageUser(["ADMIN"]);

  const profiles = await prisma.visaProfile.findMany({
    orderBy: { updatedAt: "desc" },
    include: { user: { select: { jobSeekerProfile: { select: { name: true } }, email: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-slate-900">비자 검토</h1>
      <p className="text-sm text-amber-700">
        AI/본인 입력은 참고용입니다. 최종 취업 허용 여부는 반드시 관리자가 공식 확인 후
        &quot;관리자 확인 완료&quot;로 전환하세요.
      </p>

      {profiles.length === 0 ? (
        <EmptyState title="등록된 비자 정보가 없습니다." />
      ) : (
        <div className="flex flex-col gap-3">
          {profiles.map((p) => (
            <Card key={p.id}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900">
                    {p.user.jobSeekerProfile?.name ?? p.user.email}
                  </p>
                  <p className="text-sm text-slate-500">
                    {p.visaType} · {p.visaStatus}
                  </p>
                  {p.expiryDate && (
                    <p className="text-xs text-slate-400">
                      만료일: {p.expiryDate.toLocaleDateString("ko-KR")}
                    </p>
                  )}
                </div>
                <Badge tone={verificationTone[p.verificationStatus]}>
                  {verificationLabel[p.verificationStatus]}
                </Badge>
              </div>
              <VisaVerifyControl
                userId={p.userId}
                currentStatus={p.verificationStatus}
                currentAllowed={p.employmentAllowed}
              />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
