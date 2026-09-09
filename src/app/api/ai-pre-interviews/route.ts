import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import {
  handleRouteError,
  jsonCreated,
  jsonOk,
  parseJson,
  requireAuth,
} from "@/lib/recruit/api";

const schema = z.object({
  applicationId: z.string().min(1),
  jobTitle: z.string().optional(),
});

/**
 * AI pre-interview: generates questions / stores answers / summarizes.
 * Results are advisory only — never auto-reject.
 */
export async function POST(request: NextRequest) {
  try {
    const { user } = await requireAuth(request, [Role.COMPANY]);
    const company = await prisma.companyProfile.findUnique({
      where: { userId: user.id },
    });
    if (!company) {
      const err = new Error("COMPANY_PROFILE_MISSING");
      (err as Error & { status: number }).status = 400;
      throw err;
    }
    const body = await parseJson(request, schema);
    const app = await prisma.application.findUnique({
      where: { id: body.applicationId },
      include: { jobPost: true },
    });
    if (!app || app.companyId !== company.id) {
      const err = new Error("FORBIDDEN");
      (err as Error & { status: number }).status = 403;
      throw err;
    }

    const title = body.jobTitle || app.jobPost.title;
    const questions = [
      `${title} 직무에서 가장 자신 있는 경험은 무엇인가요?`,
      "관련 경력이나 유사 업무 경험을 설명해 주세요.",
      "한국어로 근무 지시를 이해하고 수행할 수 있나요?",
      "희망 근무 조건(지역/급여/입사일)을 알려 주세요.",
      "추가로 확인하고 싶은 사항이 있나요?",
    ];

    const row = await prisma.aiPreInterview.create({
      data: {
        applicationId: app.id,
        questionsJson: JSON.stringify(questions),
        summary: null,
        highlights: null,
        followUps: JSON.stringify([
          "경력 기간 확인 필요",
          "비자/취업가능 여부 공식 확인 필요",
        ]),
        disclaimer:
          "AI 결과는 참고용이며 자동 탈락/채용 결정에 사용되지 않습니다.",
      },
    });
    return jsonCreated(row);
  } catch (e) {
    return handleRouteError(e);
  }
}
