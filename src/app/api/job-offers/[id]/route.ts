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
const schema = z.object({ action: z.enum(["ACCEPT", "DECLINE"]) });

export async function PATCH(request: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const { user } = await requireAuth(request, [Role.JOB_SEEKER]);
    const body = await parseJson(request, schema);
    const offer = await prisma.jobOffer.findUnique({
      where: { id },
      include: { company: true },
    });
    if (!offer || offer.jobSeekerId !== user.id) {
      const err = new Error("FORBIDDEN");
      (err as Error & { status: number }).status = 403;
      throw err;
    }
    const status = body.action === "ACCEPT" ? "ACCEPTED" : "DECLINED";
    const updated = await prisma.jobOffer.update({
      where: { id },
      data: { status },
    });
    await createNotification({
      userId: offer.company.userId,
      type: body.action === "ACCEPT" ? "OFFER_ACCEPTED" : "OFFER_DECLINED",
      title:
        body.action === "ACCEPT"
          ? "Offer가 수락되었습니다"
          : "Offer가 거절되었습니다",
    });
    return jsonOk(updated);
  } catch (e) {
    return handleRouteError(e);
  }
}
