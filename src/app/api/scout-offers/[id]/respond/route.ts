import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { scoutOfferRespondSchema } from "@/lib/talent/validation";
import { errorResponse, KnownApiError } from "@/lib/api/respond";

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/scout-offers/[id]/respond">
) {
  try {
    const user = await requireUser(["JOB_SEEKER"]);
    const { id } = await ctx.params;
    const { action } = scoutOfferRespondSchema.parse(await request.json());

    const offer = await prisma.scoutOffer.findUnique({ where: { id } });
    if (!offer || offer.jobSeekerId !== user.id) {
      throw new KnownApiError("NOT_FOUND", "스카우트 제안을 찾을 수 없습니다.", 404);
    }
    if (offer.status !== "PENDING" && offer.status !== "OPENED") {
      throw new KnownApiError("ALREADY_RESPONDED", "이미 응답한 제안입니다.", 409);
    }
    if (offer.expiresAt && offer.expiresAt.getTime() < Date.now()) {
      throw new KnownApiError("EXPIRED", "만료된 제안입니다.", 409);
    }

    const nextStatus = action === "ACCEPT" ? "ACCEPTED" : "DECLINED";

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.scoutOffer.update({ where: { id }, data: { status: nextStatus } });

      if (action === "ACCEPT") {
        await tx.notification.create({
          data: {
            userId: offer.companyId,
            type: "SCOUT_ACCEPTED",
            title: "스카우트 제안이 수락되었습니다.",
            body: offer.title,
          },
        });
      }

      return result;
    });

    return NextResponse.json({ offer: updated });
  } catch (error) {
    return errorResponse(error);
  }
}
