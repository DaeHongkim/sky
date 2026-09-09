import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  handleRouteError,
  jsonOk,
  requireAuth,
} from "@/lib/recruit/api";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, ctx: Ctx) {
  try {
    const { id: jobSeekerId } = await ctx.params;
    const { user } = await requireAuth(request, [Role.COMPANY]);
    const company = await prisma.companyProfile.findUnique({
      where: { userId: user.id },
    });
    if (!company) {
      const err = new Error("COMPANY_PROFILE_MISSING");
      (err as Error & { status: number }).status = 400;
      throw err;
    }

    const publicResume = await prisma.resume.findFirst({
      where: {
        userId: jobSeekerId,
        visibility: "PUBLIC",
        status: "COMPLETE",
      },
      include: {
        careers: true,
        educations: true,
        certificates: true,
        languages: true,
        skills: true,
        user: {
          select: {
            id: true,
            jobSeekerProfile: {
              select: {
                name: true,
                nationality: true,
                careerYears: true,
                koreanLevel: true,
                desiredJobCategory: true,
                desiredWorkRegion: true,
                introduction: true,
                skills: true,
                koreaResident: true,
              },
            },
          },
        },
      },
    });

    if (!publicResume) {
      const err = new Error("NOT_FOUND");
      (err as Error & { status: number }).status = 404;
      throw err;
    }

    await prisma.talentViewLog.create({
      data: {
        companyId: company.id,
        jobSeekerId,
        viewerUserId: user.id,
      },
    });

    // Still minimize contact PII
    return jsonOk({
      ...publicResume,
      user: {
        id: publicResume.user.id,
        jobSeekerProfile: publicResume.user.jobSeekerProfile
          ? {
              ...publicResume.user.jobSeekerProfile,
              name: publicResume.user.jobSeekerProfile.name
                ? `${publicResume.user.jobSeekerProfile.name.slice(0, 1)}**`
                : "비공개",
            }
          : null,
      },
    });
  } catch (e) {
    return handleRouteError(e);
  }
}
