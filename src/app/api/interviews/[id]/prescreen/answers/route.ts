import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { prescreenAnswersSchema } from "@/lib/ai-prescreen/validation";
import { summarizePrescreenAnswers } from "@/lib/ai-prescreen/provider";
import { errorResponse, KnownApiError } from "@/lib/api/respond";
import type { Prisma } from "@/generated/prisma/client";

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/interviews/[id]/prescreen/answers">
) {
  try {
    const user = await requireUser(["JOB_SEEKER"]);
    const { id } = await ctx.params;
    const { answers } = prescreenAnswersSchema.parse(await request.json());

    const interview = await prisma.interview.findUnique({ where: { id } });
    if (!interview || interview.jobSeekerId !== user.id) {
      throw new KnownApiError("NOT_FOUND", "면접을 찾을 수 없습니다.", 404);
    }

    const existing = await prisma.aiPrescreenResult.findUnique({ where: { interviewId: id } });
    if (!existing) {
      throw new KnownApiError("NOT_GENERATED", "아직 생성된 질문이 없습니다.", 404);
    }
    if ((existing.answers as unknown[]).length > 0) {
      throw new KnownApiError("ALREADY_ANSWERED", "이미 답변을 제출했습니다.", 409);
    }

    const questions = existing.questions as string[];
    const summary = await summarizePrescreenAnswers(questions, answers);

    const updated = await prisma.aiPrescreenResult.update({
      where: { interviewId: id },
      data: {
        answers: answers as Prisma.InputJsonValue,
        summary: summary.summary,
        keyExperiences: summary.keyExperiences,
        needsVerification: summary.needsVerification,
      },
    });

    await prisma.notification.create({
      data: {
        userId: interview.companyId,
        type: "SYSTEM",
        title: "AI 사전면접 답변이 도착했습니다.",
        linkUrl: `/recruit/company/interviews`,
      },
    });

    return NextResponse.json({ result: updated, aiGenerated: summary.aiGenerated });
  } catch (error) {
    return errorResponse(error);
  }
}
