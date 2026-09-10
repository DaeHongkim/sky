/**
 * 지원 언어 (spec 17절 기준). 클라이언트/서버 양쪽에서 공유하므로 "server-only"를 넣지 않는다.
 */
export const SUPPORTED_LANGUAGES = [
  { code: "ko", label: "Korean" },
  { code: "en", label: "English" },
  { code: "zh-CN", label: "Chinese Simplified" },
  { code: "zh-TW", label: "Chinese Traditional" },
  { code: "ja", label: "Japanese" },
  { code: "vi", label: "Vietnamese" },
  { code: "th", label: "Thai" },
  { code: "id", label: "Indonesian" },
  { code: "mn", label: "Mongolian" },
  { code: "ru", label: "Russian" },
  { code: "uz", label: "Uzbek" },
  { code: "ne", label: "Nepali" },
  { code: "km", label: "Cambodian" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];
