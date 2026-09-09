import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requirePageUser } from "@/lib/auth/page-guard";
import Card from "@/components/recruit/ui/Card";
import Badge from "@/components/recruit/ui/Badge";
import TalentBookmarkButton from "@/components/recruit/TalentBookmarkButton";
import ScoutOfferForm from "@/components/recruit/ScoutOfferForm";

export const dynamic = "force-dynamic";

export default async function TalentDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const user = await requirePageUser(["COMPANY"]);
  const { userId } = await params;

  const [profile, publicResumes, bookmark] = await Promise.all([
    prisma.jobSeekerProfile.findUnique({
      where: { userId },
      include: { user: { select: { status: true } } },
    }),
    prisma.resume.findMany({
      where: { userId, visibility: "PUBLIC", status: "COMPLETED" },
      include: { careers: true, educations: true, certificates: true, languages: true },
    }),
    prisma.talentBookmark.findUnique({
      where: { companyId_jobSeekerId: { companyId: user.id, jobSeekerId: userId } },
    }),
  ]);

  if (!profile || profile.user.status !== "ACTIVE" || publicResumes.length === 0) {
    notFound();
  }

  // 인재 상세 열람 로그를 남긴다.
  void prisma.talentViewLog
    .create({ data: { companyId: user.id, viewerUserId: user.id, jobSeekerId: userId } })
    .catch(() => {});

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{profile.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {profile.desiredJobCategory ?? "직종 미기재"} · {profile.desiredRegion ?? "지역 미기재"}
          </p>
        </div>
        <TalentBookmarkButton jobSeekerId={userId} initialBookmarked={!!bookmark} />
      </div>

      <Card className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-slate-500">경력</p>
          <p className="font-medium text-slate-900">{profile.careerYears ?? 0}년</p>
        </div>
        <div>
          <p className="text-slate-500">국적</p>
          <p className="font-medium text-slate-900">{profile.nationality ?? "-"}</p>
        </div>
        <div>
          <p className="text-slate-500">한국어 수준</p>
          <p className="font-medium text-slate-900">{profile.koreanLevel ?? "-"}</p>
        </div>
        <div>
          <p className="text-slate-500">입사가능일</p>
          <p className="font-medium text-slate-900">
            {profile.availableFrom?.toLocaleDateString("ko-KR") ?? "협의가능"}
          </p>
        </div>
      </Card>

      {profile.selfIntroduction && (
        <Card>
          <h2 className="font-semibold text-slate-900">자기소개</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{profile.selfIntroduction}</p>
        </Card>
      )}

      <div>
        <h2 className="mb-2 font-semibold text-slate-900">공개 이력서 ({publicResumes.length})</h2>
        <div className="flex flex-col gap-3">
          {publicResumes.map((resume) => (
            <Card key={resume.id}>
              <p className="font-medium text-slate-900">{resume.title}</p>
              {resume.profileSummary && (
                <p className="mt-1 text-sm text-slate-600">{resume.profileSummary}</p>
              )}
              {resume.careers.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {resume.careers.map((c) => (
                    <Badge key={c.id} tone="neutral">
                      {c.companyName} · {c.position}
                    </Badge>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      <ScoutOfferForm jobSeekerId={userId} />
    </div>
  );
}
