export type SupportedLanguage =
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

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
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

export type TranslateInput = {
  text: string;
  sourceLang?: string | null;
  targetLang: string;
  contextType?: string;
};

export type TranslateResult = {
  translatedText: string;
  detectedSourceLang?: string;
  provider: string;
};

export interface TranslationProvider {
  name: string;
  translate(input: TranslateInput): Promise<TranslateResult>;
  detectLanguage(text: string): Promise<string>;
  translateBatch(inputs: TranslateInput[]): Promise<TranslateResult[]>;
}

export class MockTranslationProvider implements TranslationProvider {
  name = "mock";

  async translate(input: TranslateInput): Promise<TranslateResult> {
    const detected = await this.detectLanguage(input.text);
    return {
      translatedText: `[${input.targetLang}] ${input.text}`,
      detectedSourceLang: input.sourceLang || detected,
      provider: this.name,
    };
  }

  async detectLanguage(text: string): Promise<string> {
    if (/[가-힣]/.test(text)) return "ko";
    if (/[ぁ-んァ-ン]/.test(text)) return "ja";
    if (/[一-龥]/.test(text)) return "zh-CN";
    if (/[а-яА-ЯЁё]/.test(text)) return "ru";
    return "en";
  }

  async translateBatch(inputs: TranslateInput[]): Promise<TranslateResult[]> {
    return Promise.all(inputs.map((i) => this.translate(i)));
  }
}

export class OpenAITranslationProvider implements TranslationProvider {
  name = "openai";

  async translate(input: TranslateInput): Promise<TranslateResult> {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error("OPENAI_API_KEY missing");
    // Provider swap-ready stub: call OpenAI when key is present.
    // Intentionally not auto-failing hiring decisions.
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
            content: `Translate to ${input.targetLang}. Return only the translation.`,
          },
          { role: "user", content: input.text },
        ],
        temperature: 0.2,
      }),
    });
    if (!res.ok) throw new Error(`OPENAI_TRANSLATE_FAILED_${res.status}`);
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const translatedText = data.choices?.[0]?.message?.content?.trim() || "";
    if (!translatedText) throw new Error("OPENAI_EMPTY_TRANSLATION");
    return {
      translatedText,
      detectedSourceLang: input.sourceLang || undefined,
      provider: this.name,
    };
  }

  async detectLanguage(text: string): Promise<string> {
    return new MockTranslationProvider().detectLanguage(text);
  }

  async translateBatch(inputs: TranslateInput[]): Promise<TranslateResult[]> {
    return Promise.all(inputs.map((i) => this.translate(i)));
  }
}

export class GoogleTranslationProvider implements TranslationProvider {
  name = "google";
  async translate(_input: TranslateInput): Promise<TranslateResult> {
    if (!process.env.GOOGLE_TRANSLATE_API_KEY) {
      throw new Error("GOOGLE_TRANSLATE_API_KEY missing");
    }
    throw new Error("GOOGLE_PROVIDER_NOT_WIRED");
  }
  async detectLanguage(text: string) {
    return new MockTranslationProvider().detectLanguage(text);
  }
  async translateBatch(inputs: TranslateInput[]) {
    return Promise.all(inputs.map((i) => this.translate(i)));
  }
}

export class DeepLTranslationProvider implements TranslationProvider {
  name = "deepl";
  async translate(_input: TranslateInput): Promise<TranslateResult> {
    if (!process.env.DEEPL_API_KEY) throw new Error("DEEPL_API_KEY missing");
    throw new Error("DEEPL_PROVIDER_NOT_WIRED");
  }
  async detectLanguage(text: string) {
    return new MockTranslationProvider().detectLanguage(text);
  }
  async translateBatch(inputs: TranslateInput[]) {
    return Promise.all(inputs.map((i) => this.translate(i)));
  }
}

export function getTranslationProvider(): TranslationProvider {
  const name = (process.env.TRANSLATION_PROVIDER || "mock").toLowerCase();
  switch (name) {
    case "openai":
      return new OpenAITranslationProvider();
    case "google":
      return new GoogleTranslationProvider();
    case "deepl":
      return new DeepLTranslationProvider();
    default:
      return new MockTranslationProvider();
  }
}
