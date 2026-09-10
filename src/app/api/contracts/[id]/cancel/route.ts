import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { errorResponse, KnownApiError } from "@/lib/api/respond";

export async function POST(
  _request: Request,
  ctx: RouteContext<"/api/contracts/[id]/cancel">
) {
  try {
    const user = await requireUser(["COMPANY"]);
    const { id } = await ctx.params;

    const contract = await prisma.employmentContract.findUnique({ where: { id } });
    if (!contract || contract.companyId !== user.id) {
      throw new KnownApiError("NOT_FOUND", "계약서를 찾을 수 없습니다.", 404);
    }
    if (contract.status === "SIGNED" || contract.status === "CANCELLED") {
      throw new KnownApiError("INVALID_STATUS", "이미 완료되었거나 취소된 계약입니다.", 409);
    }

    const updated = await prisma.employmentContract.update({
      where: { id },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    });

    return NextResponse.json({ contract: updated });
  } catch (error) {
    return errorResponse(error);
  }
}
