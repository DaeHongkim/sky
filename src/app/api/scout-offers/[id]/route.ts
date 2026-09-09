import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { requireUser } from "@/lib/auth/session";
import { createNotification } from "@/lib/notifications";

type Ctx = { params: Promise<{ id: string }> };

const respondSchema = z.object({
  action: z.enum(["OPEN", "ACCEPT", "DECLINE"]),
});

export async function PATCH(request: Request, ctx: Ctx) {
  try {
    const user = await requireUser([Role.JOB_SEEKER]);
    const { id } = await ctx.params;
    const body = respondSchema.parse(await request.json());

    const offer = await prisma.scoutOffer.findFirst({
      where: { id, jobSeekerId: user.id },
      include: { company: true },
    });
    if (!offer) return jsonError("NOT_FOUND", 404);
    if (offer.status === "EXPIRED" || (offer.expiresAt && offer.expiresAt < new Date())) {
      await prisma.scoutOffer.update({ where: { id }, data: { status: "EXPIRED" } });
      return jsonError("SCOUT_EXPIRED", 400);
    }

    let status = offer.status;
    if (body.action === "OPEN" && offer.status === "PENDING") status = "OPENED";
    if (body.action === "ACCEPT") status = "ACCEPTED";
    if (body.action === "DECLINE") status = "DECLINED";

    const updated = await prisma.scoutOffer.update({
      where: { id },
      data: { status },
    });

    if (body.action === "ACCEPT" || body.action === "DECLINE") {
      await createNotification({
        userId: offer.company.userId,
        type: body.action === "ACCEPT" ? "SCOUT_ACCEPTED" : "SCOUT_DECLINED",
        title: body.action === "ACCEPT" ? "스카우트가 수락되었습니다" : "스카우트가 거절되었습니다",
        body: offer.title,
        linkUrl: "/recruit/company/scouts",
      });
    }

    return jsonOk(updated);
  } catch (error) {
    return handleRouteError(error);
  }
}
