import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { errorResponse, KnownApiError } from "@/lib/api/respond";
import { notifyHqHireCompleted } from "@/lib/integrations/hq";

export async function POST(
  _request: Request,
  ctx: RouteContext<"/api/contracts/[id]/sign">
) {
  try {
    const user = await requireUser(["JOB_SEEKER"]);
    const { id } = await ctx.params;

    const contract = await prisma.employmentContract.findUnique({
      where: { id },
      include: { application: { select: { id: true, jobPostId: true, status: true } } },
    });
    if (!contract || contract.jobSeekerId !== user.id) {
      throw new KnownApiError("NOT_FOUND", "계약서를 찾을 수 없습니다.", 404);
    }
    if (contract.status !== "AGREED") {
      throw new KnownApiError("INVALID_STATUS", "동의(AGREED) 후에만 서명할 수 있습니다.", 409);
    }

    const signedAt = new Date();
    // integrityHash: 서명 시점의 계약 원문이 위변조되지 않았음을 추후 검증하기 위한 해시.
    const integrityHash = createHash("sha256")
      .update(`${contract.id}:${contract.version}:${contract.contentOriginal}`)
      .digest("hex");
    // signatureHash: 서명 행위(누가, 언제, 어떤 계약에) 자체를 표상하는 해시 — audit 용도.
    const signatureHash = createHash("sha256")
      .update(`${user.id}:${contract.id}:${signedAt.toISOString()}`)
      .digest("hex");

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.employmentContract.update({
        where: { id },
        data: { status: "SIGNED", signedAt, integrityHash, signatureHash },
      });

      // 계약 서명 완료 = 채용확정. 이 시점까지가 HIHONG RECRUIT의 책임 범위다.
      await tx.application.update({
        where: { id: contract.applicationId },
        data: { status: "HIRED" },
      });
      await tx.applicationHistory.create({
        data: {
          applicationId: contract.applicationId,
          fromStatus: contract.application.status,
          toStatus: "HIRED",
          changedByUserId: user.id,
        },
      });
      await tx.notification.createMany({
        data: [
          {
            userId: contract.jobSeekerId,
            type: "HIRED",
            title: "채용이 확정되었습니다.",
            body: "전자근로계약 서명이 완료되어 채용이 확정되었습니다.",
          },
          {
            userId: contract.companyId,
            type: "HIRED",
            title: "채용이 확정되었습니다.",
            body: "지원자가 전자근로계약에 서명하여 채용이 확정되었습니다.",
          },
        ],
      });
      await tx.auditLog.create({
        data: {
          actorUserId: user.id,
          action: "CONTRACT_SIGNED",
          targetType: "EmploymentContract",
          targetId: id,
          metadata: { integrityHash, signatureHash },
        },
      });

      return result;
    });

    await notifyHqHireCompleted({
      applicationId: contract.applicationId,
      jobSeekerId: contract.jobSeekerId,
      companyId: contract.companyId,
      jobPostId: contract.application.jobPostId,
      contractId: contract.id,
      hiredAt: signedAt.toISOString(),
    });

    return NextResponse.json({ contract: updated });
  } catch (error) {
    return errorResponse(error);
  }
}
