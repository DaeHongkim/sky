import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { interviewCreateSchema } from "@/lib/interviews/validation";
import { errorResponse, KnownApiError } from "@/lib/api/respond";

const terminalStatuses = new Set(["HIRED", "REJECTED", "WITHDRAWN"]);

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/applications/[id]/interviews">
) {
  try {
    const user = await requireUser(["COMPANY"]);
    const { id: applicationId } = await ctx.params;
    const input = interviewCreateSchema.parse(await request.json());

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { jobPost: { select: { title: true } } },
    });
    if (!application || application.companyId !== user.id) {
      throw new KnownApiError("NOT_FOUND", "지원 내역을 찾을 수 없습니다.", 404);
    }
    if (terminalStatuses.has(application.status)) {
      throw new KnownApiError("APPLICATION_CLOSED", "이미 종료된 지원 건입니다.", 409);
    }

    const scheduledAt = new Date(input.scheduledAt);

    const interview = await prisma.$transaction(async (tx) => {
      const created = await tx.interview.create({
        data: {
          applicationId,
          companyId: user.id,
          companyUserId: user.id,
          jobSeekerId: application.jobSeekerId,
          interviewType: input.interviewType,
          scheduledAt,
          duration: input.duration,
          meetingUrl: input.meetingUrl || null,
          status: "REQUESTED",
        },
      });

      await tx.application.update({
        where: { id: applicationId },
        data: { status: "INTERVIEW_REQUESTED" },
      });
      await tx.applicationHistory.create({
        data: {
          applicationId,
          fromStatus: application.status,
          toStatus: "INTERVIEW_REQUESTED",
          changedByUserId: user.id,
        },
      });
      await tx.notification.create({
        data: {
          userId: application.jobSeekerId,
          type: "INTERVIEW_REQUESTED",
          title: "면접 요청이 도착했습니다.",
          body: `"${application.jobPost.title}" 지원 건에 대한 면접 일정이 제안되었습니다.`,
          linkUrl: "/recruit/seeker/interviews",
        },
      });

      return created;
    });

    return NextResponse.json({ interview }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
