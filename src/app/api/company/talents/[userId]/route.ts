import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { errorResponse, KnownApiError } from "@/lib/api/respond";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/company/talents/[userId]">
) {
  try {
    const user = await requireUser(["COMPANY"]);
    const { userId } = await ctx.params;

    const profile = await prisma.jobSeekerProfile.findUnique({
      where: { userId },
      select: {
        userId: true,
        name: true,
        desiredJobCategory: true,
        desiredRegion: true,
        desiredSalaryMin: true,
        desiredSalaryMax: true,
        careerYears: true,
        nationality: true,
        koreanLevel: true,
        englishLevel: true,
        availableFrom: true,
        selfIntroduction: true,
        skills: true,
        user: { select: { status: true } },
      },
    });

    if (!profile || profile.user.status !== "ACTIVE") {
      throw new KnownApiError("NOT_FOUND", "인재를 찾을 수 없습니다.", 404);
    }

    // 검색 결과가 아닌 상세 열람만 공개 이력서 보유 여부를 재확인하고, 열람 로그를 남긴다.
    const publicResumes = await prisma.resume.findMany({
      where: { userId, visibility: "PUBLIC", status: "COMPLETED" },
      include: { careers: true, educations: true, certificates: true, languages: true },
    });
    if (publicResumes.length === 0) {
      throw new KnownApiError("NOT_FOUND", "인재를 찾을 수 없습니다.", 404);
    }

    await prisma.talentViewLog.create({
      data: { companyId: user.id, viewerUserId: user.id, jobSeekerId: userId },
    });

    return NextResponse.json({ profile, resumes: publicResumes });
  } catch (error) {
    return errorResponse(error);
  }
}
