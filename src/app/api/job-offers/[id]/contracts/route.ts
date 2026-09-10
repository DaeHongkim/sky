import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { contractCreateSchema } from "@/lib/contracts/validation";
import { errorResponse, KnownApiError } from "@/lib/api/respond";

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/job-offers/[id]/contracts">
) {
  try {
    const user = await requireUser(["COMPANY"]);
    const { id: jobOfferId } = await ctx.params;
    const { contentOriginal } = contractCreateSchema.parse(await request.json());

    const offer = await prisma.jobOffer.findUnique({ where: { id: jobOfferId } });
    if (!offer || offer.companyId !== user.id) {
      throw new KnownApiError("NOT_FOUND", "Offer를 찾을 수 없습니다.", 404);
    }
    if (offer.status !== "ACCEPTED") {
      throw new KnownApiError(
        "OFFER_NOT_ACCEPTED",
        "Offer가 수락된 이후에만 계약서를 작성할 수 있습니다.",
        409
      );
    }

    const existing = await prisma.employmentContract.findFirst({ where: { jobOfferId } });
    if (existing) {
      throw new KnownApiError("CONTRACT_EXISTS", "이미 계약서가 작성되어 있습니다.", 409);
    }

    const contract = await prisma.employmentContract.create({
      data: {
        contractGroupId: randomUUID(),
        version: 1,
        applicationId: offer.applicationId,
        jobOfferId,
        jobSeekerId: offer.jobSeekerId,
        companyId: user.id,
        companyUserId: user.id,
        status: "DRAFT",
        contentOriginal,
      },
    });

    return NextResponse.json({ contract }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
