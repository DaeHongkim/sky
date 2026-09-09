import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { requireUser } from "@/lib/auth/session";
import { getTranslationProvider, SUPPORTED_LANGS, type SupportedLang } from "@/lib/translation/provider";

const schema = z.object({
  text: z.string().min(1).max(20000),
  targetLang: z.string(),
  sourceLang: z.string().optional(),
  sourceType: z.string().optional(),
  sourceId: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = schema.parse(await request.json());
    if (!SUPPORTED_LANGS.includes(body.targetLang as SupportedLang)) {
      return jsonError("UNSUPPORTED_LANGUAGE", 400);
    }

    const provider = getTranslationProvider();
    try {
      const result = await provider.translate(
        body.text,
        body.targetLang as SupportedLang,
        body.sourceLang,
      );

      await prisma.translationRecord.create({
        data: {
          sourceType: body.sourceType || "adhoc",
          sourceId: body.sourceId,
          sourceLang: result.detectedSourceLang,
          targetLang: body.targetLang,
          sourceText: body.text,
          translatedText: result.translatedText,
          provider: result.provider,
        },
      });
      await prisma.translationUsage.create({
        data: {
          userId: user.id,
          provider: result.provider,
          charCount: body.text.length,
        },
      });

      return jsonOk(result);
    } catch (err) {
      return jsonError(
        err instanceof Error ? err.message : "TRANSLATION_FAILED",
        502,
      );
    }
  } catch (error) {
    return handleRouteError(error);
  }
}

void Role;
