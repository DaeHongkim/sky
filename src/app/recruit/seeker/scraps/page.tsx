import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { requirePageUser } from "@/lib/auth/page-guard";
import Card from "@/components/recruit/ui/Card";
import Badge from "@/components/recruit/ui/Badge";
import EmptyState from "@/components/recruit/ui/EmptyState";

export const dynamic = "force-dynamic";

export default async function SeekerScrapsPage() {
  const user = await requirePageUser(["JOB_SEEKER"]);
  const scraps = await prisma.jobScrap.findMany({
    where: { jobSeekerId: user.id },
    orderBy: { createdAt: "desc" },
    include: { jobPost: { include: { company: { select: { companyName: true } } } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-slate-900">스크랩</h1>
      {scraps.length === 0 ? (
        <EmptyState title="스크랩한 공고가 없습니다." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {scraps.map((scrap) => (
            <Link key={scrap.id} href={`/recruit/jobs/${scrap.jobPost.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-slate-900">{scrap.jobPost.title}</p>
                  {scrap.jobPost.status !== "OPEN" && <Badge tone="warning">마감</Badge>}
                </div>
                <p className="mt-1 text-sm text-slate-500">{scrap.jobPost.company.companyName}</p>
                <p className="mt-2 text-sm text-slate-600">{scrap.jobPost.workLocation}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
