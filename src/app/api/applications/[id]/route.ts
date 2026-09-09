import { NextRequest } from "next/server";
import { ApplicationStatus, Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import {
  handleRouteError,
  jsonOk,
  parseJson,
  requireAuth,
} from "@/lib/recruit/api";
import { createNotification } from "@/lib/recruit/audit";
import { enqueueHireCompleted, deliverHireWebhook } from "@/lib/integrations/hq/hired";
import { isAdminRole } from "@/lib/permissions/roles";

const statusSchema = z.object({
  status: z.enum([
    "APPLIED",
    "DOCUMENT_REVIEW",
    "INTERVIEW_REQUESTED",
    "INTERVIEW_SCHEDULED",
    "INTERVIEW_COMPLETED",
    "OFFER",
    "HIRED",
    "REJECTED",
    "WITHDRAWN",
  ]),
  memo: z.string().max(5000).optional(),
  note: z.string().max(1000).optional(),
});

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const { user } = await requireAuth(request);
    const body = await parseJson(request, statusSchema);
    const app = await prisma.application.findUnique({
      where: { id },
      include: { jobPost: true, company: true },
    });
    if (!app) {
      const err = new Error("NOT_FOUND");
      (err as Error & { status: number }).status = 404;
      throw err;
    }

    if (body.status === "WITHDRAWN") {
      if (app.jobSeekerId !== user.id) {
        const err = new Error("FORBIDDEN");
        (err as Error & { status: number }).status = 403;
        throw err;
      }
    } else if (user.role === Role.COMPANY) {
      const company = await prisma.companyProfile.findUnique({
        where: { userId: user.id },
      });
      if (!company || company.id !== app.companyId) {
        const err = new Error("FORBIDDEN");
        (err as Error & { status: number }).status = 403;
        throw err;
      }
    } else if (!isAdminRole(user.role)) {
      const err = new Error("FORBIDDEN");
      (err as Error & { status: number }).status = 403;
      throw err;
    }

    const updated = await prisma.application.update({
      where: { id },
      data: {
        status: body.status as ApplicationStatus,
        memo: body.memo ?? app.memo,
        withdrawnAt: body.status === "WITHDRAWN" ? new Date() : app.withdrawnAt,
      },
    });

    await prisma.applicationHistory.create({
      data: {
        applicationId: id,
        fromStatus: app.status,
        toStatus: body.status as ApplicationStatus,
        changedById: user.id,
        note: body.note,
      },
    });

    await createNotification({
      userId: app.jobSeekerId,
      type: "APPLICATION_STATUS",
      title: `지원 상태가 ${body.status}(으)로 변경되었습니다`,
      body: app.jobPost.title,
      linkUrl: "/recruit/seeker/applications",
    });

    if (body.status === "HIRED") {
      const outbox = await enqueueHireCompleted({
        event: "HIRED",
        applicationId: app.id,
        companyId: app.companyId,
        jobSeekerId: app.jobSeekerId,
        jobPostId: app.jobPostId,
        hiredAt: new Date().toISOString(),
      });
      await deliverHireWebhook(outbox.id);
      await createNotification({
        userId: app.company.userId,
        type: "HIRED",
        title: "채용이 확정되었습니다",
        body: "HIHONG HQ 온보딩 연동 이벤트가 준비되었습니다.",
        linkUrl: "/recruit/company",
      });
    }

    return jsonOk(updated);
  } catch (e) {
    return handleRouteError(e);
  }
}
