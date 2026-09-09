import { prisma } from "@/lib/db/prisma";
import { requirePageUser } from "@/lib/auth/page-guard";
import Badge from "@/components/recruit/ui/Badge";
import EmptyState from "@/components/recruit/ui/EmptyState";

export const dynamic = "force-dynamic";

export default async function AdminApplicationsPage() {
  await requirePageUser(["ADMIN"]);
  const applications = await prisma.application.findMany({
    orderBy: { appliedAt: "desc" },
    take: 200,
    include: {
      jobPost: { select: { title: true } },
      company: { select: { companyName: true } },
      jobSeeker: { select: { jobSeekerProfile: { select: { name: true } } } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-slate-900">전체 지원현황</h1>
      {applications.length === 0 ? (
        <EmptyState title="지원 내역이 없습니다." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-3 py-2">지원자</th>
                <th className="px-3 py-2">공고</th>
                <th className="px-3 py-2">기업</th>
                <th className="px-3 py-2">상태</th>
                <th className="px-3 py-2">지원일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.map((a) => (
                <tr key={a.id}>
                  <td className="px-3 py-2 font-medium text-slate-900">
                    {a.jobSeeker.jobSeekerProfile?.name ?? "-"}
                  </td>
                  <td className="px-3 py-2 text-slate-500">{a.jobPost.title}</td>
                  <td className="px-3 py-2 text-slate-500">{a.company.companyName}</td>
                  <td className="px-3 py-2">
                    <Badge tone="neutral">{a.status}</Badge>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-slate-500">
                    {a.appliedAt.toLocaleDateString("ko-KR")}
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
