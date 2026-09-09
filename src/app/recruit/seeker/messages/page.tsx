import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { requirePageUser } from "@/lib/auth/page-guard";
import Card from "@/components/recruit/ui/Card";
import Badge from "@/components/recruit/ui/Badge";
import EmptyState from "@/components/recruit/ui/EmptyState";

export const dynamic = "force-dynamic";

export default async function SeekerMessagesPage() {
  const user = await requirePageUser(["JOB_SEEKER"]);

  const conversations = await prisma.conversation.findMany({
    where: { jobSeekerId: user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      company: { select: { companyProfile: { select: { companyName: true } } } },
      jobPost: { select: { title: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-slate-900">메시지</h1>
      {conversations.length === 0 ? (
        <EmptyState title="주고받은 메시지가 없습니다." />
      ) : (
        <div className="flex flex-col gap-2">
          {conversations.map((c) => (
            <Link key={c.id} href={`/recruit/seeker/messages/${c.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-slate-900">
                    {c.company.companyProfile?.companyName ?? "기업"}
                  </p>
                  {c.jobPost && <Badge tone="neutral">{c.jobPost.title}</Badge>}
                </div>
                {c.messages[0] && (
                  <p className="mt-1 truncate text-sm text-slate-500">{c.messages[0].content}</p>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
