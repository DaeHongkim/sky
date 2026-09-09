import { NextRequest } from "next/server";
import { ApplicationStatus, Role } from "@prisma/client";
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
import { enqueueHireCompleted, deliverHireWebhook } from "@/lib/integrations/hq/hired";

const applySchema = z.object({
  resumeId: z.string().min(1),
});

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, ctx: Ctx) {
  try {
    const { id: jobPostId } = await ctx.params;
    const { user } = await requireAuth(request, [Role.JOB_SEEKER]);
    const body = await parseJson(request, applySchema);

    const jobPost = await prisma.jobPost.findUnique({ where: { id: jobPostId } });
    if (!jobPost || jobPost.status !== "OPEN") {
      const err = new Error("JOB_NOT_OPEN");
      (err as Error & { status: number }).status = 400;
      throw err;
    }

    const resume = await prisma.resume.findUnique({ where: { id: body.resumeId } });
    if (!resume || resume.userId !== user.id) {
      const err = new Error("INVALID_RESUME");
      (err as Error & { status: number }).status = 400;
      throw err;
    }

    const existing = await prisma.application.findUnique({
      where: {
        jobPostId_jobSeekerId: { jobPostId, jobSeekerId: user.id },
      },
    });
    if (existing && existing.status !== "WITHDRAWN") {
      const err = new Error("ALREADY_APPLIED");
      (err as Error & { status: number }).status = 409;
      throw err;
    }

    const application = existing
      ? await prisma.application.update({
          where: { id: existing.id },
          data: {
            resumeId: body.resumeId,
            status: "APPLIED",
            appliedAt: new Date(),
            withdrawnAt: null,
          },
        })
      : await prisma.application.create({
          data: {
            jobPostId,
            jobSeekerId: user.id,
            resumeId: body.resumeId,
            companyId: jobPost.companyId,
            status: "APPLIED",
          },
        });

    await prisma.applicationHistory.create({
      data: {
        applicationId: application.id,
        fromStatus: existing?.status,
        toStatus: "APPLIED",
        changedById: user.id,
      },
    });

    const company = await prisma.companyProfile.findUnique({
      where: { id: jobPost.companyId },
    });
    if (company) {
      await createNotification({
        userId: company.userId,
        type: "NEW_APPLICATION",
        title: "신규 지원자가 등록되었습니다",
        body: jobPost.title,
        linkUrl: `/recruit/company/applicants`,
        data: { applicationId: application.id },
      });
    }
    await createNotification({
      userId: user.id,
      type: "APPLICATION_SUBMITTED",
      title: "지원이 완료되었습니다",
      body: jobPost.title,
      linkUrl: `/recruit/seeker/applications`,
    });

    return jsonCreated(application);
  } catch (e) {
    return handleRouteError(e);
  }
}
