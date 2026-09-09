import { getTranslationProvider, TranslateInput } from "./provider";
import { prisma } from "@/lib/db/prisma";

export async function translateText(
  input: TranslateInput & { userId?: string },
) {
  const provider = getTranslationProvider();
  try {
    const result = await provider.translate(input);
    await prisma.translationUsage.create({
      data: {
        userId: input.userId,
        provider: result.provider,
        sourceLang: result.detectedSourceLang || input.sourceLang || undefined,
        targetLang: input.targetLang,
        charCount: input.text.length,
        contextType: input.contextType,
        success: true,
      },
    });
    return result;
  } catch (e) {
    await prisma.translationUsage.create({
      data: {
        userId: input.userId,
        provider: provider.name,
        sourceLang: input.sourceLang || undefined,
        targetLang: input.targetLang,
        charCount: input.text.length,
        contextType: input.contextType,
        success: false,
        errorMessage: e instanceof Error ? e.message : "translate_failed",
      },
    });
    throw e;
  }
}
