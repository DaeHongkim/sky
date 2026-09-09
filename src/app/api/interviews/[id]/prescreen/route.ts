import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { errorResponse, KnownApiError } from "@/lib/api/respond";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/interviews/[id]/prescreen">
) {
  try {
    const user = await requireUser(["JOB_SEEKER", "COMPANY"]);
    const { id } = await ctx.params;

    const interview = await prisma.interview.findUnique({ where: { id } });
    const isOwner =
      interview &&
      ((user.role === "COMPANY" && interview.companyId === user.id) ||
        (user.role === "JOB_SEEKER" && interview.jobSeekerId === user.id));
    if (!interview || !isOwner) {
      throw new KnownApiError("NOT_FOUND", "면접을 찾을 수 없습니다.", 404);
    }

    const result = await prisma.aiPrescreenResult.findUnique({ where: { interviewId: id } });
    return NextResponse.json({ result });
  } catch (error) {
    return errorResponse(error);
  }
}
