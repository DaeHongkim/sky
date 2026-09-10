import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { requirePageUser } from "@/lib/auth/page-guard";
import Card from "@/components/recruit/ui/Card";
import Badge from "@/components/recruit/ui/Badge";
import EmptyState from "@/components/recruit/ui/EmptyState";
import ResumeActions from "@/components/recruit/ResumeActions";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = { DRAFT: "작성중", COMPLETED: "완료" };

export default async function ResumeListPage() {
  const user = await requirePageUser(["JOB_SEEKER"]);
  const resumes = await prisma.resume.findMany({
    where: { userId: user.id },
    orderBy: [{ isPrimary: "desc" }, { updatedAt: "desc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">내 이력서</h1>
        <Link
          href="/recruit/seeker/resumes/new"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          + 새 이력서
        </Link>
      </div>

      {resumes.length === 0 ? (
        <EmptyState
          title="아직 작성한 이력서가 없습니다."
          description="이력서를 작성하고 채용공고에 지원해보세요."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {resumes.map((resume) => (
            <Card key={resume.id}>
              <div className="flex items-start justify-between gap-2">
                <Link
                  href={`/recruit/seeker/resumes/${resume.id}`}
                  className="font-semibold text-slate-900 hover:underline"
                >
                  {resume.title}
                </Link>
                {resume.isPrimary && <Badge tone="info">대표</Badge>}
              </div>
              <div className="mt-2 flex gap-2">
                <Badge tone={resume.status === "COMPLETED" ? "success" : "neutral"}>
                  {statusLabel[resume.status]}
                </Badge>
                <Badge tone={resume.visibility === "PUBLIC" ? "success" : "neutral"}>
                  {resume.visibility === "PUBLIC" ? "공개" : "비공개"}
                </Badge>
              </div>
              <p className="mt-2 text-xs text-slate-400">
                최근 수정: {resume.updatedAt.toLocaleDateString("ko-KR")}
              </p>
              <ResumeActions resumeId={resume.id} isPrimary={resume.isPrimary} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
