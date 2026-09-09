import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import {
  handleRouteError,
  jsonOk,
  parseJson,
  requireAuth,
} from "@/lib/recruit/api";

type Ctx = { params: Promise<{ id: string }> };
const answerSchema = z.object({
  answers: z.array(z.string()),
});

export async function PATCH(request: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const { user } = await requireAuth(request, [Role.JOB_SEEKER]);
    const body = await parseJson(request, answerSchema);
    const row = await prisma.aiPreInterview.findUnique({
      where: { id },
      include: { application: true },
    });
    if (!row || row.application.jobSeekerId !== user.id) {
      const err = new Error("FORBIDDEN");
      (err as Error & { status: number }).status = 403;
      throw err;
    }
    const summary = `지원자 답변 ${body.answers.length}건 수집. 주요 포인트는 수동 검토가 필요합니다.`;
    const updated = await prisma.aiPreInterview.update({
      where: { id },
      data: {
        answersJson: JSON.stringify(body.answers),
        summary,
        highlights: JSON.stringify(body.answers.slice(0, 3)),
      },
    });
    return jsonOk(updated);
  } catch (e) {
    return handleRouteError(e);
  }
}
