import { prisma } from "@/lib/db/prisma";
import { requirePageUser } from "@/lib/auth/page-guard";
import Card from "@/components/recruit/ui/Card";
import Badge from "@/components/recruit/ui/Badge";
import VisaForm from "./VisaForm";

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

export default async function SeekerVisaPage() {
  const user = await requirePageUser(["JOB_SEEKER"]);
  const visa = await prisma.visaProfile.findUnique({ where: { userId: user.id } });

  return (
    <div className="mx-auto max-w-md flex flex-col gap-6">
      <h1 className="text-xl font-bold text-slate-900">비자/체류 정보</h1>

      <Card className="bg-amber-50 text-sm text-amber-800">
        본 정보는 참고용이며, AI 또는 본인 입력만으로 비자 적법성을 최종 판단하지 않습니다.
        정확한 취업 가능 여부는 반드시 관리자 확인을 거쳐야 합니다.
      </Card>

      {visa && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">현재 확인 상태</span>
          <Badge tone={verificationTone[visa.verificationStatus]}>
            {verificationLabel[visa.verificationStatus]}
          </Badge>
        </div>
      )}
      {visa && (
        <p className="text-sm text-slate-600">
          취업 허용 여부:{" "}
          <span className="font-medium text-slate-900">
            {visa.employmentAllowed ? "허용" : "미확인"}
          </span>
        </p>
      )}

      <Card>
        <VisaForm
          initial={{
            visaType: visa?.visaType ?? "",
            visaStatus: visa?.visaStatus ?? "",
            issueDate: visa?.issueDate?.toISOString().slice(0, 10) ?? "",
            expiryDate: visa?.expiryDate?.toISOString().slice(0, 10) ?? "",
          }}
        />
      </Card>
    </div>
  );
}
