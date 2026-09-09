import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { requireUser } from "@/lib/auth/session";
import { createNotification } from "@/lib/notifications";

type Ctx = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  status: z.enum(["REQUESTED", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
  scheduledAt: z.string().optional().nullable(),
  meetingUrl: z.string().optional().nullable(),
  answers: z.array(z.object({ question: z.string(), answer: z.string() })).optional(),
});

export async function PATCH(request: Request, ctx: Ctx) {
  try {
    const user = await requireUser([Role.JOB_SEEKER, Role.COMPANY]);
    const { id } = await ctx.params;
    const body = patchSchema.parse(await request.json());

    const interview = await prisma.interview.findUnique({
      where: { id },
      include: { company: true, aiPrescreen: true },
    });
    if (!interview) return jsonError("NOT_FOUND", 404);

    const isSeeker = user.role === Role.JOB_SEEKER && interview.jobSeekerId === user.id;
    const isCompany = user.role === Role.COMPANY && interview.company.userId === user.id;
    if (!isSeeker && !isCompany) return jsonError("FORBIDDEN", 403);

    const updated = await prisma.interview.update({
      where: { id },
      data: {
        status: body.status,
        scheduledAt: body.scheduledAt !== undefined
          ? body.scheduledAt
            ? new Date(body.scheduledAt)
            : null
          : undefined,
        meetingUrl: body.meetingUrl ?? undefined,
      },
    });

    if (body.answers && interview.aiPrescreen) {
      // AI summarizes answers but MUST NOT auto-reject
      const summary = body.answers
        .map((a, i) => `Q${i + 1}: ${a.answer.slice(0, 200)}`)
        .join("\n");
      await prisma.aiPrescreen.update({
        where: { interviewId: id },
        data: {
          answers: body.answers as object[],
          summary: `사전면접 응답 요약(참고용, 자동탈락 아님):\n${summary}`,
          highlights: "주요 경험은 기업 담당자가 직접 확인해야 합니다.",
          followUps: "추가 확인이 필요한 항목은 면접관이 판단합니다.",
        },
      });
    }

    if (body.status === "CONFIRMED") {
      await createNotification({
        userId: isCompany ? interview.jobSeekerId : interview.company.userId,
        type: "INTERVIEW_CONFIRMED",
        title: "면접이 확정되었습니다",
        linkUrl: isCompany ? "/recruit/my/interviews" : "/recruit/company/interviews",
      });
    }

    return jsonOk(updated);
  } catch (error) {
    return handleRouteError(error);
  }
}
