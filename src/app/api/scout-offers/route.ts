import { NextRequest } from "next/server";
import { Role, ScoutStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import {
  handleRouteError,
  jsonCreated,
  jsonOk,
  parseJson,
  requireAuth,
} from "@/lib/recruit/api";
import { createNotification } from "@/lib/recruit/audit";

const createSchema = z.object({
  jobSeekerId: z.string().min(1),
  jobPostId: z.string().optional(),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
  expiresAt: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { user } = await requireAuth(request);
    if (user.role === Role.JOB_SEEKER) {
      const rows = await prisma.scoutOffer.findMany({
        where: { jobSeekerId: user.id },
        include: {
          company: { select: { companyName: true, logoUrl: true } },
          jobPost: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return jsonOk(rows);
    }
    if (user.role === Role.COMPANY) {
      const company = await prisma.companyProfile.findUnique({
        where: { userId: user.id },
      });
      if (!company) return jsonOk([]);
      const rows = await prisma.scoutOffer.findMany({
        where: { companyId: company.id },
        include: {
          jobSeeker: {
            select: {
              id: true,
              name: true,
              jobSeekerProfile: { select: { desiredJobCategory: true } },
            },
          },
          jobPost: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return jsonOk(rows);
    }
    const err = new Error("FORBIDDEN");
    (err as Error & { status: number }).status = 403;
    throw err;
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
    const body = await parseJson(request, createSchema);
    const publicOk = await prisma.resume.findFirst({
      where: {
        userId: body.jobSeekerId,
        visibility: "PUBLIC",
        status: "COMPLETE",
      },
    });
    if (!publicOk) {
      const err = new Error("TALENT_NOT_PUBLIC");
      (err as Error & { status: number }).status = 400;
      throw err;
    }
    const offer = await prisma.scoutOffer.create({
      data: {
        companyId: company.id,
        jobSeekerId: body.jobSeekerId,
        senderUserId: user.id,
        jobPostId: body.jobPostId,
        title: body.title,
        message: body.message,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
      },
    });
    await createNotification({
      userId: body.jobSeekerId,
      type: "SCOUT",
      title: "스카우트 제안이 도착했습니다",
      body: body.title,
      linkUrl: "/recruit/seeker/scouts",
    });
    return jsonCreated(offer);
  } catch (e) {
    return handleRouteError(e);
  }
}
