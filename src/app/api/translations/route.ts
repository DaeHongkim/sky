import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { translateRequestSchema } from "@/lib/translation/validation";
import { getTranslationProvider } from "@/lib/translation/provider";
import { errorResponse } from "@/lib/api/respond";
import { isRateLimited } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();

    if (isRateLimited(`translate:${user.id}`, { windowMs: 60_000, max: 20 })) {
      return NextResponse.json(
        { error: "RATE_LIMITED", message: "번역 요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
        { status: 429 }
      );
    }

    const input = translateRequestSchema.parse(await request.json());
    const provider = getTranslationProvider();
    const result = await provider.translate({
      text: input.text,
      targetLanguage: input.targetLanguage,
    });

    // 번역 사용량 추적 및 캐시 목적으로 기록한다 (관리자 "번역 사용량" 화면에서 조회).
    if (result.translated) {
      await prisma.translation.create({
        data: {
          sourceType: input.sourceType,
          sourceId: input.sourceId,
          sourceLanguage: result.sourceLanguage,
          targetLanguage: input.targetLanguage,
          sourceText: input.text,
          translatedText: result.translatedText,
          provider: result.provider,
          createdByUserId: user.id,
        },
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}
