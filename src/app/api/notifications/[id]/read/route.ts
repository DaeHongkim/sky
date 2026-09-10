import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { errorResponse, KnownApiError } from "@/lib/api/respond";

export async function POST(
  _request: Request,
  ctx: RouteContext<"/api/notifications/[id]/read">
) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;

    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification || notification.userId !== user.id) {
      throw new KnownApiError("NOT_FOUND", "알림을 찾을 수 없습니다.", 404);
    }

    await prisma.notification.update({ where: { id }, data: { isRead: true } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
