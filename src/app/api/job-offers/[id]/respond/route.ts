import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { offerRespondSchema } from "@/lib/offers/validation";
import { errorResponse, KnownApiError } from "@/lib/api/respond";

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/job-offers/[id]/respond">
) {
  try {
    const user = await requireUser(["JOB_SEEKER"]);
    const { id } = await ctx.params;
    const { action } = offerRespondSchema.parse(await request.json());

    const offer = await prisma.jobOffer.findUnique({ where: { id } });
    if (!offer || offer.jobSeekerId !== user.id) {
      throw new KnownApiError("NOT_FOUND", "Offer를 찾을 수 없습니다.", 404);
    }
    if (offer.status !== "PENDING") {
      throw new KnownApiError("ALREADY_RESPONDED", "이미 응답한 Offer입니다.", 409);
    }

    const updated = await prisma.jobOffer.update({
      where: { id },
      data: { status: action === "ACCEPT" ? "ACCEPTED" : "DECLINED" },
    });

    return NextResponse.json({ offer: updated });
  } catch (error) {
    return errorResponse(error);
  }
}
