import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { interviewStatusUpdateSchema } from "@/lib/interviews/validation";
import { errorResponse, KnownApiError } from "@/lib/api/respond";
import type { InterviewStatus } from "@/generated/prisma/enums";

const seekerAllowed: Record<string, InterviewStatus[]> = {
  REQUESTED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["CANCELLED"],
};
const companyAllowed: Record<string, InterviewStatus[]> = {
  REQUESTED: ["CANCELLED"],
  CONFIRMED: ["COMPLETED", "NO_SHOW", "CANCELLED"],
};

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/interviews/[id]">
) {
  try {
    const user = await requireUser(["JOB_SEEKER", "COMPANY"]);
    const { id } = await ctx.params;
    const { status } = interviewStatusUpdateSchema.parse(await request.json());

    const interview = await prisma.interview.findUnique({
      where: { id },
      include: { application: { include: { jobPost: { select: { title: true } } } } },
    });
    if (!interview) throw new KnownApiError("NOT_FOUND", "면접을 찾을 수 없습니다.", 404);

    const isOwner =
      (user.role === "COMPANY" && interview.companyId === user.id) ||
      (user.role === "JOB_SEEKER" && interview.jobSeekerId === user.id);
    if (!isOwner) throw new KnownApiError("FORBIDDEN", "접근 권한이 없습니다.", 403);

    const allowedMap = user.role === "COMPANY" ? companyAllowed : seekerAllowed;
    const allowed = allowedMap[interview.status] ?? [];
    if (!allowed.includes(status)) {
      throw new KnownApiError(
        "INVALID_TRANSITION",
        `${interview.status} 상태에서 ${status}(으)로 변경할 수 없습니다.`,
        400
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.interview.update({ where: { id }, data: { status } });

      if (status === "CONFIRMED") {
        await tx.application.update({
          where: { id: interview.applicationId },
          data: { status: "INTERVIEW_SCHEDULED" },
        });
        await tx.applicationHistory.create({
          data: {
            applicationId: interview.applicationId,
            fromStatus: interview.application.status,
            toStatus: "INTERVIEW_SCHEDULED",
            changedByUserId: user.id,
          },
        });
        await tx.notification.create({
          data: {
            userId: interview.companyId,
            type: "INTERVIEW_CONFIRMED",
            title: "면접이 확정되었습니다.",
            body: `"${interview.application.jobPost.title}" 지원자가 면접 일정을 확정했습니다.`,
          },
        });
      } else if (status === "COMPLETED") {
        await tx.application.update({
          where: { id: interview.applicationId },
          data: { status: "INTERVIEW_COMPLETED" },
        });
        await tx.applicationHistory.create({
          data: {
            applicationId: interview.applicationId,
            fromStatus: interview.application.status,
            toStatus: "INTERVIEW_COMPLETED",
            changedByUserId: user.id,
          },
        });
      }

      return result;
    });

    return NextResponse.json({ interview: updated });
  } catch (error) {
    return errorResponse(error);
  }
}
