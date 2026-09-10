import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { errorResponse, KnownApiError } from "@/lib/api/respond";

export async function POST(
  _request: Request,
  ctx: RouteContext<"/api/contracts/[id]/send">
) {
  try {
    const user = await requireUser(["COMPANY"]);
    const { id } = await ctx.params;

    const contract = await prisma.employmentContract.findUnique({ where: { id } });
    if (!contract || contract.companyId !== user.id) {
      throw new KnownApiError("NOT_FOUND", "계약서를 찾을 수 없습니다.", 404);
    }
    if (contract.status !== "DRAFT") {
      throw new KnownApiError("INVALID_STATUS", "임시저장 상태의 계약서만 발송할 수 있습니다.", 409);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.employmentContract.update({
        where: { id },
        data: { status: "SENT", sentAt: new Date() },
      });
      await tx.notification.create({
        data: {
          userId: contract.jobSeekerId,
          type: "CONTRACT_RECEIVED",
          title: "전자근로계약서가 도착했습니다.",
          linkUrl: `/recruit/seeker/contracts/${id}`,
        },
      });
      return result;
    });

    return NextResponse.json({ contract: updated });
  } catch (error) {
    return errorResponse(error);
  }
}
