import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requirePageUser } from "@/lib/auth/page-guard";
import MessageThread from "@/components/recruit/MessageThread";

export const dynamic = "force-dynamic";

export default async function CompanyMessageThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePageUser(["COMPANY"]);
  const { id } = await params;

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: { jobSeeker: { select: { jobSeekerProfile: { select: { name: true } } } } },
  });
  if (!conversation || conversation.companyId !== user.id) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-lg font-bold text-slate-900">
        {conversation.jobSeeker.jobSeekerProfile?.name ?? "지원자"}
      </h1>
      <MessageThread conversationId={id} currentUserId={user.id} />
    </div>
  );
}
