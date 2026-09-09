import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { applicationStatusUpdateSchema } from "@/lib/applications/validation";
import { errorResponse, KnownApiError } from "@/lib/api/respond";
import type { NotificationType } from "@/generated/prisma/enums";

const statusNotification: Partial<Record<string, NotificationType>> = {
  INTERVIEW_REQUESTED: "INTERVIEW_REQUESTED",
  OFFER: "OFFER_RECEIVED",
  HIRED: "HIRED",
};

const terminalStatuses = new Set(["HIRED", "REJECTED", "WITHDRAWN"]);

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/applications/[id]">
) {
  try {
    const user = await requireUser(["COMPANY"]);
    const { id } = await ctx.params;

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        jobPost: { select: { title: true } },
        resume: {
          include: { careers: true, educations: true, certificates: true, languages: true, portfolios: true },
        },
        jobSeeker: { include: { jobSeekerProfile: true } },
        histories: { orderBy: { createdAt: "asc" } },
      },
    });
    if (!application || application.companyId !== user.id) {
      throw new KnownApiError("NOT_FOUND", "지원 내역을 찾을 수 없습니다.", 404);
    }

    return NextResponse.json({ application });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/applications/[id]">
) {
  try {
    const user = await requireUser(["COMPANY"]);
    const { id } = await ctx.params;
    const { status, memo } = applicationStatusUpdateSchema.parse(await request.json());

    const application = await prisma.application.findUnique({
      where: { id },
      include: { jobPost: { select: { title: true } } },
    });
    if (!application || application.companyId !== user.id) {
      throw new KnownApiError("NOT_FOUND", "지원 내역을 찾을 수 없습니다.", 404);
    }
    if (terminalStatuses.has(application.status)) {
      throw new KnownApiError(
        "APPLICATION_CLOSED",
        "이미 종료된 지원 건은 상태를 변경할 수 없습니다.",
        409
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const app = await tx.application.update({
        where: { id },
        data: {
          status,
          ...(memo !== undefined ? { companyMemo: memo } : {}),
        },
      });

      await tx.applicationHistory.create({
        data: {
          applicationId: id,
          fromStatus: application.status,
          toStatus: status,
          changedByUserId: user.id,
          memo,
        },
      });

      const notifType = statusNotification[status] ?? "APPLICATION_STATUS_CHANGED";
      await tx.notification.create({
        data: {
          userId: application.jobSeekerId,
          type: notifType,
          title: "지원 상태가 변경되었습니다.",
          body: `"${application.jobPost.title}" 지원 상태: ${status}`,
          linkUrl: "/recruit/seeker/applications",
        },
      });

      return app;
    });

    return NextResponse.json({ application: updated });
  } catch (error) {
    return errorResponse(error);
  }
}
