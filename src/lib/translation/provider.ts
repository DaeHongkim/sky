export type SupportedLang =
  | "ko"
  | "en"
  | "zh-CN"
  | "zh-TW"
  | "ja"
  | "vi"
  | "th"
  | "id"
  | "mn"
  | "ru"
  | "uz"
  | "ne"
  | "km";

export const SUPPORTED_LANGS: SupportedLang[] = [
  "ko",
  "en",
  "zh-CN",
  "zh-TW",
  "ja",
  "vi",
  "th",
  "id",
  "mn",
  "ru",
  "uz",
  "ne",
  "km",
];

export interface TranslationResult {
  translatedText: string;
  detectedSourceLang?: string;
  provider: string;
}

export interface TranslationProvider {
  name: string;
  translate(text: string, targetLang: SupportedLang, sourceLang?: string): Promise<TranslationResult>;
  detectLanguage(text: string): Promise<string>;
  translateBatch(
    texts: string[],
    targetLang: SupportedLang,
    sourceLang?: string,
  ): Promise<TranslationResult[]>;
}

/** Dev/fallback provider — prefixes text; never calls external APIs. */
export class MockTranslationProvider implements TranslationProvider {
  name = "mock";

  async translate(text: string, targetLang: SupportedLang, sourceLang?: string): Promise<TranslationResult> {
    return {
      translatedText: `[${targetLang}] ${text}`,
      detectedSourceLang: sourceLang || "auto",
      provider: this.name,
    };
  }

  async detectLanguage(text: string): Promise<string> {
    if (/[가-힣]/.test(text)) return "ko";
    if (/[ぁ-んァ-ン]/.test(text)) return "ja";
    if (/[一-龥]/.test(text)) return "zh-CN";
    return "en";
  }

  async translateBatch(texts: string[], targetLang: SupportedLang, sourceLang?: string) {
    return Promise.all(texts.map((t) => this.translate(t, targetLang, sourceLang)));
  }
}

export class OpenAITranslationProvider implements TranslationProvider {
  name = "openai";

  async translate(text: string, targetLang: SupportedLang, sourceLang?: string): Promise<TranslationResult> {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error("OPENAI_API_KEY_MISSING");
    // Provider swap point — real call only when key present.
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Translate to ${targetLang}. Return only the translation.`,
          },
          { role: "user", content: text },
        ],
      }),
    });
    if (!res.ok) throw new Error("OPENAI_TRANSLATE_FAILED");
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return {
      translatedText: data.choices?.[0]?.message?.content?.trim() || text,
      detectedSourceLang: sourceLang,
      provider: this.name,
    };
  }

  async detectLanguage(text: string): Promise<string> {
    return new MockTranslationProvider().detectLanguage(text);
  }

  async translateBatch(texts: string[], targetLang: SupportedLang, sourceLang?: string) {
    return Promise.all(texts.map((t) => this.translate(t, targetLang, sourceLang)));
  }
}

export class GoogleTranslationProvider implements TranslationProvider {
  name = "google";

  async translate(text: string, targetLang: SupportedLang, sourceLang?: string): Promise<TranslationResult> {
    const key = process.env.GOOGLE_TRANSLATE_API_KEY;
    if (!key) throw new Error("GOOGLE_TRANSLATE_API_KEY_MISSING");
    const url = new URL("https://translation.googleapis.com/language/translate/v2");
    url.searchParams.set("key", key);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text,
        target: targetLang,
        source: sourceLang,
        format: "text",
      }),
    });
    if (!res.ok) throw new Error("GOOGLE_TRANSLATE_FAILED");
    const data = (await res.json()) as {
      data?: { translations?: { translatedText: string; detectedSourceLanguage?: string }[] };
    };
    const item = data.data?.translations?.[0];
    return {
      translatedText: item?.translatedText || text,
      detectedSourceLang: item?.detectedSourceLanguage || sourceLang,
      provider: this.name,
    };
  }

  async detectLanguage(text: string): Promise<string> {
    return new MockTranslationProvider().detectLanguage(text);
  }

  async translateBatch(texts: string[], targetLang: SupportedLang, sourceLang?: string) {
    return Promise.all(texts.map((t) => this.translate(t, targetLang, sourceLang)));
  }
}

export class DeepLTranslationProvider implements TranslationProvider {
  name = "deepl";

  async translate(text: string, targetLang: SupportedLang, sourceLang?: string): Promise<TranslationResult> {
    const key = process.env.DEEPL_API_KEY;
    if (!key) throw new Error("DEEPL_API_KEY_MISSING");
    const res = await fetch("https://api-free.deepl.com/v2/translate", {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: [text],
        target_lang: targetLang.toUpperCase().replace("-", ""),
        source_lang: sourceLang?.toUpperCase(),
      }),
    });
    if (!res.ok) throw new Error("DEEPL_TRANSLATE_FAILED");
    const data = (await res.json()) as {
      translations?: { text: string; detected_source_language?: string }[];
    };
    const item = data.translations?.[0];
    return {
      translatedText: item?.text || text,
      detectedSourceLang: item?.detected_source_language || sourceLang,
      provider: this.name,
    };
  }

  async detectLanguage(text: string): Promise<string> {
    return new MockTranslationProvider().detectLanguage(text);
  }

  async translateBatch(texts: string[], targetLang: SupportedLang, sourceLang?: string) {
    return Promise.all(texts.map((t) => this.translate(t, targetLang, sourceLang)));
  }
}

export function getTranslationProvider(): TranslationProvider {
  const name = (process.env.TRANSLATION_PROVIDER || "mock").toLowerCase();
  if (name === "openai") return new OpenAITranslationProvider();
  if (name === "google") return new GoogleTranslationProvider();
  if (name === "deepl") return new DeepLTranslationProvider();
  return new MockTranslationProvider();
}
