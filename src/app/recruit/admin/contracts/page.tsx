import { prisma } from "@/lib/db/prisma";
import { requirePageUser } from "@/lib/auth/page-guard";
import Badge from "@/components/recruit/ui/Badge";
import EmptyState from "@/components/recruit/ui/EmptyState";

export const dynamic = "force-dynamic";

const statusTone: Record<string, "neutral" | "success" | "warning" | "danger" | "info"> = {
  DRAFT: "neutral",
  SENT: "info",
  VIEWED: "info",
  AGREED: "warning",
  SIGNED: "success",
  CANCELLED: "danger",
};

export default async function AdminContractsPage() {
  await requirePageUser(["ADMIN"]);
  // 그룹당 최신 버전만 보여준다.
  const all = await prisma.employmentContract.findMany({
    orderBy: [{ contractGroupId: "asc" }, { version: "desc" }],
    include: {
      company: { select: { companyName: true } },
      jobSeeker: { select: { jobSeekerProfile: { select: { name: true } } } },
    },
  });
  const latestPerGroup = new Map<string, (typeof all)[number]>();
  for (const c of all) {
    if (!latestPerGroup.has(c.contractGroupId)) latestPerGroup.set(c.contractGroupId, c);
  }
  const contracts = Array.from(latestPerGroup.values()).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-slate-900">전체 전자근로계약</h1>
      {contracts.length === 0 ? (
        <EmptyState title="계약 내역이 없습니다." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-3 py-2">구직자</th>
                <th className="px-3 py-2">기업</th>
                <th className="px-3 py-2">버전</th>
                <th className="px-3 py-2">상태</th>
                <th className="px-3 py-2">서명일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contracts.map((c) => (
                <tr key={c.id}>
                  <td className="px-3 py-2 font-medium text-slate-900">
                    {c.jobSeeker.jobSeekerProfile?.name ?? "-"}
                  </td>
                  <td className="px-3 py-2 text-slate-500">{c.company.companyName}</td>
                  <td className="px-3 py-2 text-slate-500">V{c.version}</td>
                  <td className="px-3 py-2">
                    <Badge tone={statusTone[c.status]}>{c.status}</Badge>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-slate-500">
                    {c.signedAt?.toLocaleDateString("ko-KR") ?? "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
