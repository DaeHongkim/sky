import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { requireUser } from "@/lib/auth/session";
import { createNotification } from "@/lib/notifications";

type Ctx = { params: Promise<{ id: string }> };

const respondSchema = z.object({
  action: z.enum(["ACCEPT", "DECLINE"]),
});

export async function PATCH(request: Request, ctx: Ctx) {
  try {
    const user = await requireUser([Role.JOB_SEEKER]);
    const { id } = await ctx.params;
    const body = respondSchema.parse(await request.json());

    const offer = await prisma.jobOffer.findFirst({
      where: { id, jobSeekerId: user.id },
      include: { company: true },
    });
    if (!offer) return jsonError("NOT_FOUND", 404);
    if (offer.status !== "PENDING") return jsonError("OFFER_NOT_PENDING", 400);
    if (offer.expiresAt && offer.expiresAt < new Date()) {
      await prisma.jobOffer.update({ where: { id }, data: { status: "EXPIRED" } });
      return jsonError("OFFER_EXPIRED", 400);
    }

    const status = body.action === "ACCEPT" ? "ACCEPTED" : "DECLINED";
    const updated = await prisma.jobOffer.update({
      where: { id },
      data: { status, respondedAt: new Date() },
    });

    await createNotification({
      userId: offer.company.userId,
      type: body.action === "ACCEPT" ? "OFFER_ACCEPTED" : "OFFER_DECLINED",
      title: body.action === "ACCEPT" ? "Offer가 수락되었습니다" : "Offer가 거절되었습니다",
      linkUrl: "/recruit/company/offers",
    });

    return jsonOk(updated);
  } catch (error) {
    return handleRouteError(error);
  }
}
