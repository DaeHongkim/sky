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
import { createNotification } from "@/lib/recruit/audit";

const createSchema = z.object({
  applicationId: z.string().min(1),
  salary: z.number().int().nonnegative().optional(),
  employmentType: z.string().optional(),
  workLocation: z.string().optional(),
  startDate: z.string().optional(),
  workingHours: z.string().optional(),
  benefits: z.string().optional(),
  message: z.string().optional(),
  expiresAt: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { user } = await requireAuth(request);
    if (user.role === Role.JOB_SEEKER) {
      return jsonOk(
        await prisma.jobOffer.findMany({
          where: { jobSeekerId: user.id },
          include: {
            company: { select: { companyName: true } },
            jobPost: { select: { title: true } },
          },
          orderBy: { createdAt: "desc" },
        }),
      );
    }
    if (user.role === Role.COMPANY) {
      const company = await prisma.companyProfile.findUnique({
        where: { userId: user.id },
      });
      if (!company) return jsonOk([]);
      return jsonOk(
        await prisma.jobOffer.findMany({
          where: { companyId: company.id },
          include: {
            jobSeeker: { select: { name: true, email: true } },
            jobPost: { select: { title: true } },
          },
          orderBy: { createdAt: "desc" },
        }),
      );
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
    const app = await prisma.application.findUnique({
      where: { id: body.applicationId },
    });
    if (!app || app.companyId !== company.id) {
      const err = new Error("FORBIDDEN");
      (err as Error & { status: number }).status = 403;
      throw err;
    }

    const offer = await prisma.jobOffer.create({
      data: {
        applicationId: app.id,
        companyId: company.id,
        jobSeekerId: app.jobSeekerId,
        jobPostId: app.jobPostId,
        salary: body.salary,
        employmentType: body.employmentType,
        workLocation: body.workLocation,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        workingHours: body.workingHours,
        benefits: body.benefits,
        message: body.message,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
      },
    });

    await prisma.application.update({
      where: { id: app.id },
      data: { status: "OFFER" },
    });
    await prisma.applicationHistory.create({
      data: {
        applicationId: app.id,
        fromStatus: app.status,
        toStatus: "OFFER",
        changedById: user.id,
      },
    });
    await createNotification({
      userId: app.jobSeekerId,
      type: "OFFER",
      title: "채용 Offer가 도착했습니다",
      linkUrl: "/recruit/seeker/offers",
    });

    return jsonCreated(offer);
  } catch (e) {
    return handleRouteError(e);
  }
}
