import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requirePageUser } from "@/lib/auth/page-guard";
import MessageThread from "@/components/recruit/MessageThread";

export const dynamic = "force-dynamic";

export default async function SeekerMessageThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePageUser(["JOB_SEEKER"]);
  const { id } = await params;

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: { company: { select: { companyProfile: { select: { companyName: true } } } } },
  });
  if (!conversation || conversation.jobSeekerId !== user.id) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-lg font-bold text-slate-900">
        {conversation.company.companyProfile?.companyName ?? "기업"}
      </h1>
      <MessageThread conversationId={id} currentUserId={user.id} />
    </div>
  );
}
