import { prisma } from "@/lib/db/prisma";
import { requirePageUser } from "@/lib/auth/page-guard";
import Badge from "@/components/recruit/ui/Badge";
import EmptyState from "@/components/recruit/ui/EmptyState";

export const dynamic = "force-dynamic";

export default async function AdminInterviewsPage() {
  await requirePageUser(["ADMIN"]);
  const interviews = await prisma.interview.findMany({
    orderBy: { scheduledAt: "desc" },
    take: 200,
    include: {
      company: { select: { companyName: true } },
      jobSeeker: { select: { jobSeekerProfile: { select: { name: true } } } },
      application: { select: { jobPost: { select: { title: true } } } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-slate-900">전체 면접</h1>
      {interviews.length === 0 ? (
        <EmptyState title="면접 내역이 없습니다." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-3 py-2">구직자</th>
                <th className="px-3 py-2">기업</th>
                <th className="px-3 py-2">공고</th>
                <th className="px-3 py-2">유형</th>
                <th className="px-3 py-2">일시</th>
                <th className="px-3 py-2">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {interviews.map((iv) => (
                <tr key={iv.id}>
                  <td className="px-3 py-2 font-medium text-slate-900">
                    {iv.jobSeeker.jobSeekerProfile?.name ?? "-"}
                  </td>
                  <td className="px-3 py-2 text-slate-500">{iv.company.companyName}</td>
                  <td className="px-3 py-2 text-slate-500">{iv.application.jobPost.title}</td>
                  <td className="px-3 py-2 text-slate-500">{iv.interviewType}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-slate-500">
                    {iv.scheduledAt?.toLocaleString("ko-KR") ?? "-"}
                  </td>
                  <td className="px-3 py-2">
                    <Badge tone="neutral">{iv.status}</Badge>
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
