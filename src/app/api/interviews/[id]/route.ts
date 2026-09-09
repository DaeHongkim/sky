import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import {
  handleRouteError,
  jsonOk,
  parseJson,
  requireAuth,
} from "@/lib/recruit/api";
import { createNotification } from "@/lib/recruit/audit";

type Ctx = { params: Promise<{ id: string }> };

const schema = z.object({
  status: z.enum(["REQUESTED", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]),
  scheduledAt: z.string().optional(),
  meetingUrl: z.string().optional(),
});

export async function PATCH(request: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const { user } = await requireAuth(request);
    const body = await parseJson(request, schema);
    const interview = await prisma.interview.findUnique({
      where: { id },
      include: { company: true },
    });
    if (!interview) {
      const err = new Error("NOT_FOUND");
      (err as Error & { status: number }).status = 404;
      throw err;
    }

    const isSeeker = user.id === interview.jobSeekerId;
    const isCompany =
      user.role === Role.COMPANY &&
      (await prisma.companyProfile.findFirst({
        where: { userId: user.id, id: interview.companyId },
      }));
    if (!isSeeker && !isCompany) {
      const err = new Error("FORBIDDEN");
      (err as Error & { status: number }).status = 403;
      throw err;
    }

    const updated = await prisma.interview.update({
      where: { id },
      data: {
        status: body.status,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
        meetingUrl: body.meetingUrl,
      },
    });

    const notifyUserId = isSeeker ? interview.company.userId : interview.jobSeekerId;
    await createNotification({
      userId: notifyUserId,
      type: "INTERVIEW_STATUS",
      title: `면접 상태가 ${body.status}(으)로 변경되었습니다`,
    });

    return jsonOk(updated);
  } catch (e) {
    return handleRouteError(e);
  }
}
