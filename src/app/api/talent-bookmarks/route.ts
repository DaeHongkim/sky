import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import {
  handleRouteError,
  jsonCreated,
  jsonOk,
  parseJson,
  requireAuth,
} from "@/lib/recruit/api";

const schema = z.object({ jobSeekerId: z.string().min(1) });

export async function GET(request: NextRequest) {
  try {
    const { user } = await requireAuth(request, [Role.COMPANY]);
    const company = await prisma.companyProfile.findUnique({
      where: { userId: user.id },
    });
    if (!company) return jsonOk([]);
    const rows = await prisma.talentBookmark.findMany({
      where: { companyId: company.id },
      include: {
        jobSeeker: {
          select: {
            id: true,
            name: true,
            jobSeekerProfile: {
              select: {
                desiredJobCategory: true,
                careerYears: true,
                nationality: true,
                desiredWorkRegion: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return jsonOk(rows);
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireAuth(request, [Role.COMPANY]);
    const company = await prisma.companyProfile.findUnique({
      where: { userId: user.id },
    });
    if (!company) {
      const err = new Error("COMPANY_PROFILE_MISSING");
      (err as Error & { status: number }).status = 400;
      throw err;
    }
    const body = await parseJson(request, schema);
    const row = await prisma.talentBookmark.upsert({
      where: {
        companyId_jobSeekerId: {
          companyId: company.id,
          jobSeekerId: body.jobSeekerId,
        },
      },
      create: {
        companyId: company.id,
        jobSeekerId: body.jobSeekerId,
        createdByUserId: user.id,
      },
      update: {},
    });
    return jsonCreated(row);
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user } = await requireAuth(request, [Role.COMPANY]);
    const company = await prisma.companyProfile.findUnique({
      where: { userId: user.id },
    });
    const jobSeekerId = new URL(request.url).searchParams.get("jobSeekerId");
    if (!company || !jobSeekerId) {
      const err = new Error("BAD_REQUEST");
      (err as Error & { status: number }).status = 400;
      throw err;
    }
    await prisma.talentBookmark.deleteMany({
      where: { companyId: company.id, jobSeekerId },
    });
    return jsonOk({ deleted: true });
  } catch (e) {
    return handleRouteError(e);
  }
}
