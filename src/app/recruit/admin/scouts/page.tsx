import { prisma } from "@/lib/db/prisma";
import { requirePageUser } from "@/lib/auth/page-guard";
import Badge from "@/components/recruit/ui/Badge";
import EmptyState from "@/components/recruit/ui/EmptyState";

export const dynamic = "force-dynamic";

export default async function AdminScoutsPage() {
  await requirePageUser(["ADMIN"]);
  const offers = await prisma.scoutOffer.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      company: { select: { companyName: true } },
      jobSeeker: { select: { jobSeekerProfile: { select: { name: true } } } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-slate-900">전체 스카우트</h1>
      {offers.length === 0 ? (
        <EmptyState title="스카우트 제안 내역이 없습니다." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-3 py-2">제목</th>
                <th className="px-3 py-2">기업</th>
                <th className="px-3 py-2">대상 구직자</th>
                <th className="px-3 py-2">상태</th>
                <th className="px-3 py-2">발송일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {offers.map((o) => (
                <tr key={o.id}>
                  <td className="px-3 py-2 font-medium text-slate-900">{o.title}</td>
                  <td className="px-3 py-2 text-slate-500">{o.company.companyName}</td>
                  <td className="px-3 py-2 text-slate-500">
                    {o.jobSeeker.jobSeekerProfile?.name ?? "-"}
                  </td>
                  <td className="px-3 py-2">
                    <Badge tone="neutral">{o.status}</Badge>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-slate-500">
                    {o.createdAt.toLocaleDateString("ko-KR")}
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
