import { prisma } from "@/lib/db/prisma";
import { requirePageUser } from "@/lib/auth/page-guard";
import EmptyState from "@/components/recruit/ui/EmptyState";

export const dynamic = "force-dynamic";

export default async function AdminAuditLogsPage() {
  await requirePageUser(["ADMIN"]);
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { actor: { select: { email: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-slate-900">Audit Log</h1>
      {logs.length === 0 ? (
        <EmptyState title="기록이 없습니다." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-3 py-2">시각</th>
                <th className="px-3 py-2">행위자</th>
                <th className="px-3 py-2">action</th>
                <th className="px-3 py-2">대상</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-3 py-2 whitespace-nowrap text-slate-500">
                    {log.createdAt.toLocaleString("ko-KR")}
                  </td>
                  <td className="px-3 py-2 text-slate-700">{log.actor?.email ?? "-"}</td>
                  <td className="px-3 py-2 font-medium text-slate-900">{log.action}</td>
                  <td className="px-3 py-2 text-slate-500">
                    {log.targetType ? `${log.targetType}:${log.targetId}` : "-"}
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
