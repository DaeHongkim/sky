import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { errorResponse, KnownApiError } from "@/lib/api/respond";

const schema = z.object({
  verificationStatus: z.enum(["PENDING", "VERIFIED", "REJECTED"]),
});

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/companies/[userId]">
) {
  try {
    const admin = await requireUser(["ADMIN"]);
    const { userId } = await ctx.params;
    const { verificationStatus } = schema.parse(await request.json());

    const existing = await prisma.companyProfile.findUnique({ where: { userId } });
    if (!existing) throw new KnownApiError("NOT_FOUND", "기업 정보를 찾을 수 없습니다.", 404);

    const company = await prisma.$transaction(async (tx) => {
      const updated = await tx.companyProfile.update({
        where: { userId },
        data: {
          verificationStatus,
          verifiedAt: verificationStatus === "VERIFIED" ? new Date() : null,
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId: admin.id,
          action: "COMPANY_VERIFICATION_UPDATED",
          targetType: "CompanyProfile",
          targetId: userId,
          metadata: { verificationStatus },
        },
      });

      return updated;
    });

    return NextResponse.json({ company });
  } catch (error) {
    return errorResponse(error);
  }
}
