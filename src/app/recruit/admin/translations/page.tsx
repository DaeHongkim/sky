import { prisma } from "@/lib/db/prisma";
import { requirePageUser } from "@/lib/auth/page-guard";
import Card from "@/components/recruit/ui/Card";
import EmptyState from "@/components/recruit/ui/EmptyState";

export const dynamic = "force-dynamic";

export default async function AdminTranslationsPage() {
  await requirePageUser(["ADMIN"]);

  const [total, byProvider, recent] = await Promise.all([
    prisma.translation.count(),
    prisma.translation.groupBy({ by: ["provider"], _count: { _all: true } }),
    prisma.translation.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-slate-900">번역 사용량</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="text-center">
          <p className="text-2xl font-bold text-slate-900">{total}</p>
          <p className="mt-1 text-xs text-slate-500">누적 번역 건수</p>
        </Card>
        {byProvider.map((p) => (
          <Card key={p.provider} className="text-center">
            <p className="text-2xl font-bold text-slate-900">{p._count._all}</p>
            <p className="mt-1 text-xs text-slate-500">{p.provider}</p>
          </Card>
        ))}
      </div>

      {recent.length === 0 ? (
        <EmptyState
          title="번역 사용 기록이 없습니다."
          description="OPENAI_API_KEY 환경변수가 설정되지 않으면 번역이 실제로 수행되지 않아 기록도 남지 않습니다."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-3 py-2">시각</th>
                <th className="px-3 py-2">유형</th>
                <th className="px-3 py-2">언어</th>
                <th className="px-3 py-2">provider</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recent.map((t) => (
                <tr key={t.id}>
                  <td className="px-3 py-2 whitespace-nowrap text-slate-500">
                    {t.createdAt.toLocaleString("ko-KR")}
                  </td>
                  <td className="px-3 py-2 text-slate-700">{t.sourceType}</td>
                  <td className="px-3 py-2 text-slate-500">
                    {t.sourceLanguage} → {t.targetLanguage}
                  </td>
                  <td className="px-3 py-2 text-slate-500">{t.provider}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
