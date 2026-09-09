import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { reportReviewSchema } from "@/lib/reports/validation";
import { errorResponse, KnownApiError } from "@/lib/api/respond";

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/reports/[id]">
) {
  try {
    const admin = await requireUser(["ADMIN"]);
    const { id } = await ctx.params;
    const { status, reviewNote } = reportReviewSchema.parse(await request.json());

    const existing = await prisma.report.findUnique({ where: { id } });
    if (!existing) throw new KnownApiError("NOT_FOUND", "신고를 찾을 수 없습니다.", 404);
    if (existing.status !== "PENDING") {
      throw new KnownApiError("ALREADY_REVIEWED", "이미 처리된 신고입니다.", 409);
    }

    const report = await prisma.$transaction(async (tx) => {
      const updated = await tx.report.update({
        where: { id },
        data: { status, reviewNote, reviewedByAdminId: admin.id, reviewedAt: new Date() },
      });
      await tx.auditLog.create({
        data: {
          actorUserId: admin.id,
          action: "REPORT_REVIEWED",
          targetType: "Report",
          targetId: id,
          metadata: { status, reviewNote: reviewNote ?? null },
        },
      });
      return updated;
    });

    return NextResponse.json({ report });
  } catch (error) {
    return errorResponse(error);
  }
}
