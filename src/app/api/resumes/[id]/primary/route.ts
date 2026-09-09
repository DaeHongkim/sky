import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  handleRouteError,
  jsonOk,
  requireAuth,
} from "@/lib/recruit/api";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const { user } = await requireAuth(request, [Role.JOB_SEEKER]);
    const resume = await prisma.resume.findUnique({ where: { id } });
    if (!resume || resume.userId !== user.id) {
      const err = new Error("FORBIDDEN");
      (err as Error & { status: number }).status = 403;
      throw err;
    }
    await prisma.$transaction([
      prisma.resume.updateMany({
        where: { userId: user.id },
        data: { isPrimary: false },
      }),
      prisma.resume.update({ where: { id }, data: { isPrimary: true } }),
    ]);
    return jsonOk({ primary: true, id });
  } catch (e) {
    return handleRouteError(e);
  }
}
