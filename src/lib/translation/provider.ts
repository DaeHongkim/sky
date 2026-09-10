import "server-only";
import { SUPPORTED_LANGUAGES } from "./languages";

export { SUPPORTED_LANGUAGES };

export interface TranslateInput {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string;
}

export interface TranslateResult {
  translatedText: string;
  sourceLanguage: string;
  /** 실제 번역이 수행되었는지 여부. false면 원문을 그대로 반환한 것(Provider 미연결). */
  translated: boolean;
  provider: string;
}

/**
 * AI Provider를 교체 가능하게 만드는 공통 인터페이스.
 * (예: OpenAITranslationProvider, GoogleTranslationProvider, DeepLTranslationProvider)
 * API Key는 서버 환경변수에만 저장하며, 절대 console.log로 출력하지 않는다.
 */
export interface TranslationProvider {
  translate(input: TranslateInput): Promise<TranslateResult>;
  detectLanguage(text: string): Promise<string>;
  translateBatch(inputs: TranslateInput[]): Promise<TranslateResult[]>;
}

/**
 * 실제 번역 API Key가 설정되지 않았을 때 사용하는 기본 provider.
 * 원문을 그대로 반환하고 translated:false 를 명시한다 — 번역된 것처럼 속이지 않는다.
 */
export class NullTranslationProvider implements TranslationProvider {
  async translate(input: TranslateInput): Promise<TranslateResult> {
    return {
      translatedText: input.text,
      sourceLanguage: input.sourceLanguage ?? "unknown",
      translated: false,
      provider: "none",
    };
  }
  async detectLanguage(): Promise<string> {
    return "unknown";
  }
  async translateBatch(inputs: TranslateInput[]): Promise<TranslateResult[]> {
    return Promise.all(inputs.map((i) => this.translate(i)));
  }
}

/**
 * OpenAI Chat Completions API를 사용하는 번역 Provider.
 * OPENAI_API_KEY 환경변수가 설정되어야 동작한다. (이 프로젝트 개발 환경에는
 * 키가 없어 실제 호출을 테스트하지 못했다 — 배포 전 반드시 실 키로 검증할 것.)
 */
export class OpenAITranslationProvider implements TranslationProvider {
  constructor(private apiKey: string, private model: string = "gpt-4o-mini") {}

  async translate(input: TranslateInput): Promise<TranslateResult> {
    const targetLabel =
      SUPPORTED_LANGUAGES.find((l) => l.code === input.targetLanguage)?.label ??
      input.targetLanguage;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        temperature: 0,
        messages: [
          {
            role: "system",
            content: `You are a professional translator for a job recruitment platform. Translate the user's text into ${targetLabel}. Return ONLY the translated text, no explanations.`,
          },
          { role: "user", content: input.text },
        ],
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenAI translation request failed: ${res.status}`);
    }

    const data = await res.json();
    const translatedText: string = data.choices?.[0]?.message?.content?.trim() ?? input.text;

    return {
      translatedText,
      sourceLanguage: input.sourceLanguage ?? "auto",
      translated: true,
      provider: "openai",
    };
  }

  async detectLanguage(text: string): Promise<string> {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        temperature: 0,
        messages: [
          {
            role: "system",
            content:
              "Detect the language of the user's text. Reply with ONLY the ISO 639-1 language code (e.g. ko, en, vi).",
          },
          { role: "user", content: text },
        ],
      }),
    });
    if (!res.ok) return "unknown";
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim().toLowerCase() ?? "unknown";
  }

  async translateBatch(inputs: TranslateInput[]): Promise<TranslateResult[]> {
    // 단순 구현: 순차 호출. 운영 규모가 커지면 배치/동시성 제어로 교체.
    const results: TranslateResult[] = [];
    for (const input of inputs) {
      results.push(await this.translate(input));
    }
    return results;
  }
}

export function getTranslationProvider(): TranslationProvider {
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) return new OpenAITranslationProvider(apiKey);
  return new NullTranslationProvider();
}
