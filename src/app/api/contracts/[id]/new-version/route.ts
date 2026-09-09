import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { contractCreateSchema } from "@/lib/contracts/validation";
import { errorResponse, KnownApiError } from "@/lib/api/respond";

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/contracts/[id]/new-version">
) {
  try {
    const user = await requireUser(["COMPANY"]);
    const { id } = await ctx.params;
    const { contentOriginal } = contractCreateSchema.parse(await request.json());

    const contract = await prisma.employmentContract.findUnique({ where: { id } });
    if (!contract || contract.companyId !== user.id) {
      throw new KnownApiError("NOT_FOUND", "계약서를 찾을 수 없습니다.", 404);
    }
    if (contract.status === "SIGNED" || contract.status === "CANCELLED") {
      throw new KnownApiError(
        "INVALID_STATUS",
        "서명 완료되었거나 취소된 계약은 새 버전을 만들 수 없습니다.",
        409
      );
    }

    // 수정 시 기존 계약을 덮어쓰지 않고 새 버전(V2, V3 ...)을 생성한다. 기존 버전은 보존한다.
    const newContract = await prisma.$transaction(async (tx) => {
      await tx.employmentContract.update({
        where: { id: contract.id },
        data: { status: "CANCELLED", cancelledAt: new Date() },
      });

      return tx.employmentContract.create({
        data: {
          contractGroupId: contract.contractGroupId,
          version: contract.version + 1,
          applicationId: contract.applicationId,
          jobOfferId: contract.jobOfferId,
          jobSeekerId: contract.jobSeekerId,
          companyId: contract.companyId,
          companyUserId: user.id,
          status: "DRAFT",
          contentOriginal,
        },
      });
    });

    return NextResponse.json({ contract: newContract }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
