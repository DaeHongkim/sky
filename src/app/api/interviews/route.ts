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
  interviewType: z.string().max(50).optional(),
  scheduledAt: z.string().optional(),
  durationMin: z.number().int().positive().optional(),
  meetingUrl: z.string().max(500).optional(),
  location: z.string().max(300).optional(),
  notes: z.string().max(2000).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { user } = await requireAuth(request);
    if (user.role === Role.JOB_SEEKER) {
      return jsonOk(
        await prisma.interview.findMany({
          where: { jobSeekerId: user.id },
          include: {
            company: { select: { companyName: true } },
            jobPost: { select: { title: true } },
          },
          orderBy: { scheduledAt: "asc" },
        }),
      );
    }
    if (user.role === Role.COMPANY) {
      const company = await prisma.companyProfile.findUnique({
        where: { userId: user.id },
      });
      if (!company) return jsonOk([]);
      return jsonOk(
        await prisma.interview.findMany({
          where: { companyId: company.id },
          include: {
            jobSeeker: { select: { name: true, email: true } },
            jobPost: { select: { title: true } },
          },
          orderBy: { scheduledAt: "asc" },
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

    const interview = await prisma.interview.create({
      data: {
        applicationId: app.id,
        companyId: company.id,
        jobSeekerId: app.jobSeekerId,
        jobPostId: app.jobPostId,
        interviewType: body.interviewType,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
        durationMin: body.durationMin || 60,
        meetingUrl: body.meetingUrl,
        location: body.location,
        notes: body.notes,
        status: body.scheduledAt ? "CONFIRMED" : "REQUESTED",
      },
    });

    await prisma.application.update({
      where: { id: app.id },
      data: {
        status: body.scheduledAt ? "INTERVIEW_SCHEDULED" : "INTERVIEW_REQUESTED",
      },
    });
    await prisma.applicationHistory.create({
      data: {
        applicationId: app.id,
        fromStatus: app.status,
        toStatus: body.scheduledAt ? "INTERVIEW_SCHEDULED" : "INTERVIEW_REQUESTED",
        changedById: user.id,
      },
    });

    await createNotification({
      userId: app.jobSeekerId,
      type: "INTERVIEW_REQUEST",
      title: "면접 요청이 도착했습니다",
      linkUrl: "/recruit/seeker/interviews",
    });

    return jsonCreated(interview);
  } catch (e) {
    return handleRouteError(e);
  }
}
