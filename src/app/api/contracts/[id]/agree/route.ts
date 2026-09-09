import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { errorResponse, KnownApiError } from "@/lib/api/respond";

export async function POST(
  _request: Request,
  ctx: RouteContext<"/api/contracts/[id]/agree">
) {
  try {
    const user = await requireUser(["JOB_SEEKER"]);
    const { id } = await ctx.params;

    const contract = await prisma.employmentContract.findUnique({ where: { id } });
    if (!contract || contract.jobSeekerId !== user.id) {
      throw new KnownApiError("NOT_FOUND", "계약서를 찾을 수 없습니다.", 404);
    }
    if (contract.status !== "VIEWED" && contract.status !== "SENT") {
      throw new KnownApiError("INVALID_STATUS", "동의할 수 없는 상태입니다.", 409);
    }

    const updated = await prisma.employmentContract.update({
      where: { id },
      data: { status: "AGREED", agreedAt: new Date(), viewedAt: contract.viewedAt ?? new Date() },
    });

    return NextResponse.json({ contract: updated });
  } catch (error) {
    return errorResponse(error);
  }
}
