import { NextRequest } from "next/server";
import { Role, ScoutStatus } from "@prisma/client";
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

const respondSchema = z.object({
  action: z.enum(["OPEN", "ACCEPT", "DECLINE"]),
});

export async function PATCH(request: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const { user } = await requireAuth(request, [Role.JOB_SEEKER]);
    const body = await parseJson(request, respondSchema);
    const offer = await prisma.scoutOffer.findUnique({
      where: { id },
      include: { company: true },
    });
    if (!offer || offer.jobSeekerId !== user.id) {
      const err = new Error("FORBIDDEN");
      (err as Error & { status: number }).status = 403;
      throw err;
    }

    const statusMap: Record<string, ScoutStatus> = {
      OPEN: "OPENED",
      ACCEPT: "ACCEPTED",
      DECLINE: "DECLINED",
    };
    const updated = await prisma.scoutOffer.update({
      where: { id },
      data: { status: statusMap[body.action] },
    });

    if (body.action === "ACCEPT" || body.action === "DECLINE") {
      await createNotification({
        userId: offer.company.userId,
        type: body.action === "ACCEPT" ? "SCOUT_ACCEPTED" : "SCOUT_DECLINED",
        title:
          body.action === "ACCEPT"
            ? "스카우트가 수락되었습니다"
            : "스카우트가 거절되었습니다",
        body: offer.title,
        linkUrl: "/recruit/company/scouts",
      });
    }
    return jsonOk(updated);
  } catch (e) {
    return handleRouteError(e);
  }
}
