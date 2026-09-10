import { prisma } from "@/lib/db/prisma";
import { requirePageUser } from "@/lib/auth/page-guard";
import Badge from "@/components/recruit/ui/Badge";
import EmptyState from "@/components/recruit/ui/EmptyState";

export const dynamic = "force-dynamic";

const statusTone: Record<string, "neutral" | "success" | "warning" | "danger"> = {
  DRAFT: "neutral",
  OPEN: "success",
  CLOSED: "warning",
  EXPIRED: "danger",
};

export default async function AdminJobsPage() {
  await requirePageUser(["ADMIN"]);
  const jobs = await prisma.jobPost.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { company: { select: { companyName: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-slate-900">전체 채용공고</h1>
      {jobs.length === 0 ? (
        <EmptyState title="등록된 채용공고가 없습니다." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-3 py-2">제목</th>
                <th className="px-3 py-2">기업</th>
                <th className="px-3 py-2">지역</th>
                <th className="px-3 py-2">상태</th>
                <th className="px-3 py-2">조회수</th>
                <th className="px-3 py-2">등록일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs.map((j) => (
                <tr key={j.id}>
                  <td className="px-3 py-2 font-medium text-slate-900">{j.title}</td>
                  <td className="px-3 py-2 text-slate-500">{j.company.companyName}</td>
                  <td className="px-3 py-2 text-slate-500">{j.workLocation}</td>
                  <td className="px-3 py-2">
                    <Badge tone={statusTone[j.status]}>{j.status}</Badge>
                  </td>
                  <td className="px-3 py-2 text-slate-500">{j.views}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-slate-500">
                    {j.createdAt.toLocaleDateString("ko-KR")}
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
