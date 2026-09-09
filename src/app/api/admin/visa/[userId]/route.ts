import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { visaAdminVerifySchema } from "@/lib/visa/validation";
import { errorResponse, KnownApiError } from "@/lib/api/respond";

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/visa/[userId]">
) {
  try {
    const admin = await requireUser(["ADMIN"]);
    const { userId } = await ctx.params;
    const input = visaAdminVerifySchema.parse(await request.json());

    const existing = await prisma.visaProfile.findUnique({ where: { userId } });
    if (!existing) throw new KnownApiError("NOT_FOUND", "비자 정보를 찾을 수 없습니다.", 404);

    const profile = await prisma.$transaction(async (tx) => {
      const updated = await tx.visaProfile.update({
        where: { userId },
        data: {
          verificationStatus: input.verificationStatus,
          employmentAllowed: input.employmentAllowed,
          verifiedByAdminId: admin.id,
          verifiedAt: new Date(),
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId: admin.id,
          action: "VISA_VERIFICATION_UPDATED",
          targetType: "VisaProfile",
          targetId: userId,
          metadata: input,
        },
      });

      return updated;
    });

    return NextResponse.json({ profile });
  } catch (error) {
    return errorResponse(error);
  }
}
