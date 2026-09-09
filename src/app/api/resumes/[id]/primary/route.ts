import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { errorResponse, KnownApiError } from "@/lib/api/respond";

export async function POST(
  _request: Request,
  ctx: RouteContext<"/api/resumes/[id]/primary">
) {
  try {
    const user = await requireUser(["JOB_SEEKER"]);
    const { id } = await ctx.params;

    const resume = await prisma.resume.findUnique({ where: { id } });
    if (!resume || resume.userId !== user.id) {
      throw new KnownApiError("NOT_FOUND", "이력서를 찾을 수 없습니다.", 404);
    }

    await prisma.$transaction([
      prisma.resume.updateMany({
        where: { userId: user.id, isPrimary: true },
        data: { isPrimary: false },
      }),
      prisma.resume.update({ where: { id }, data: { isPrimary: true } }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
