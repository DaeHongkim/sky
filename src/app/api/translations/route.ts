import { NextRequest } from "next/server";
import { z } from "zod";
import {
  handleRouteError,
  jsonOk,
  parseJson,
  requireAuth,
} from "@/lib/recruit/api";
import { translateText } from "@/lib/translation/service";
import { SUPPORTED_LANGUAGES } from "@/lib/translation/provider";

const schema = z.object({
  text: z.string().min(1).max(20000),
  targetLang: z.string().min(2).max(10),
  sourceLang: z.string().optional(),
  contextType: z
    .enum(["job_post", "resume", "chat", "interview", "offer", "contract"])
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireAuth(request);
    const body = await parseJson(request, schema);
    if (!SUPPORTED_LANGUAGES.includes(body.targetLang as never)) {
      // Allow any BCP47-ish code but warn via validation softness
    }
    const result = await translateText({
      text: body.text,
      targetLang: body.targetLang,
      sourceLang: body.sourceLang,
      contextType: body.contextType,
      userId: user.id,
    });
    return jsonOk(result);
  } catch (e) {
    return handleRouteError(e);
  }
}
