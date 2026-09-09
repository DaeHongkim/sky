import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { generatePrescreenQuestions } from "@/lib/ai-prescreen/provider";
import { errorResponse, KnownApiError } from "@/lib/api/respond";

export async function POST(
  _request: Request,
  ctx: RouteContext<"/api/interviews/[id]/prescreen/generate">
) {
  try {
    const user = await requireUser(["COMPANY"]);
    const { id } = await ctx.params;

    const interview = await prisma.interview.findUnique({
      where: { id },
      include: { application: { include: { jobPost: { select: { title: true, description: true } } } } },
    });
    if (!interview || interview.companyId !== user.id) {
      throw new KnownApiError("NOT_FOUND", "면접을 찾을 수 없습니다.", 404);
    }
    if (interview.interviewType !== "AI_PRESCREEN") {
      throw new KnownApiError("NOT_AI_PRESCREEN", "AI 사전면접 유형의 면접이 아닙니다.", 400);
    }

    const existing = await prisma.aiPrescreenResult.findUnique({ where: { interviewId: id } });
    if (existing) {
      throw new KnownApiError("ALREADY_GENERATED", "이미 질문이 생성되어 있습니다.", 409);
    }

    const { questions, aiGenerated } = await generatePrescreenQuestions(
      interview.application.jobPost.title,
      interview.application.jobPost.description
    );

    const result = await prisma.aiPrescreenResult.create({
      data: { interviewId: id, questions, answers: [] },
    });

    return NextResponse.json({ result, aiGenerated }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
