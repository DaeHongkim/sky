import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { errorResponse, KnownApiError } from "@/lib/api/respond";

const schema = z.object({ status: z.enum(["ACTIVE", "SUSPENDED"]) });

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/users/[id]">
) {
  try {
    const admin = await requireUser(["ADMIN"]);
    const { id } = await ctx.params;
    const { status } = schema.parse(await request.json());

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) throw new KnownApiError("NOT_FOUND", "회원을 찾을 수 없습니다.", 404);
    if (target.role === "ADMIN") {
      throw new KnownApiError("FORBIDDEN", "관리자 계정은 이 화면에서 변경할 수 없습니다.", 403);
    }
    if (target.status === "WITHDRAWN") {
      throw new KnownApiError("ALREADY_WITHDRAWN", "탈퇴한 계정입니다.", 409);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.user.update({
        where: { id },
        data: { status },
        select: { id: true, email: true, role: true, status: true },
      });
      await tx.auditLog.create({
        data: {
          actorUserId: admin.id,
          action: status === "SUSPENDED" ? "USER_SUSPENDED" : "USER_REACTIVATED",
          targetType: "User",
          targetId: id,
        },
      });
      return result;
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    return errorResponse(error);
  }
}
