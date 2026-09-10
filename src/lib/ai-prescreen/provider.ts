import "server-only";

export interface PrescreenSummary {
  summary: string;
  keyExperiences: string;
  needsVerification: string;
}

const DEFAULT_QUESTIONS = [
  "지원 직무와 관련된 본인의 경험을 간단히 소개해 주세요.",
  "이 직무에 지원하게 된 이유는 무엇인가요?",
  "근무 가능한 요일/시간대를 알려주세요.",
  "이전 직장(또는 아르바이트)에서 가장 어려웠던 상황과 해결 방법을 알려주세요.",
  "궁금한 점이나 회사에 전달하고 싶은 말이 있다면 적어주세요.",
];

/**
 * AI는 질문 생성/답변 요약만 수행하며, 합격/불합격 등 최종 채용 결정을 내리지 않는다.
 * OPENAI_API_KEY가 없으면 기본 질문 템플릿과, 요약 대신 "확인 필요" 안내를 반환한다.
 */
export async function generatePrescreenQuestions(
  jobTitle: string,
  jobDescription: string
): Promise<{ questions: string[]; aiGenerated: boolean }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { questions: DEFAULT_QUESTIONS, aiGenerated: false };
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content:
              "You generate 5 concise pre-screening interview questions in Korean for a job recruitment platform, based on the job title and description. Return ONLY a JSON array of 5 strings, no explanation.",
          },
          { role: "user", content: `직무: ${jobTitle}\n설명: ${jobDescription}` },
        ],
      }),
    });
    if (!res.ok) throw new Error(`OpenAI request failed: ${res.status}`);
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content?.trim() ?? "[]";
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return { questions: parsed.slice(0, 8), aiGenerated: true };
    }
    return { questions: DEFAULT_QUESTIONS, aiGenerated: false };
  } catch {
    // 실패 시 조용히 기본 질문으로 대체 — 사용자에게는 실패를 숨기지 않고 aiGenerated:false로 알린다.
    return { questions: DEFAULT_QUESTIONS, aiGenerated: false };
  }
}

export async function summarizePrescreenAnswers(
  questions: string[],
  answers: string[]
): Promise<PrescreenSummary & { aiGenerated: boolean }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      summary: "AI 요약 서비스가 연결되지 않아 자동 요약을 생성하지 못했습니다. 답변 원문을 직접 확인해주세요.",
      keyExperiences: "",
      needsVerification: "AI 요약 미제공 — 관리자/담당자의 직접 확인이 필요합니다.",
      aiGenerated: false,
    };
  }

  try {
    const qa = questions.map((q, i) => `Q${i + 1}. ${q}\nA${i + 1}. ${answers[i] ?? "(무응답)"}`).join("\n\n");
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0,
        messages: [
          {
            role: "system",
            content:
              'You summarize a candidate\'s AI pre-screening interview answers for a recruiter, in Korean. You never make a final hire/reject decision. Return ONLY JSON: {"summary": string, "keyExperiences": string, "needsVerification": string}.',
          },
          { role: "user", content: qa },
        ],
      }),
    });
    if (!res.ok) throw new Error(`OpenAI request failed: ${res.status}`);
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content?.trim() ?? "{}";
    const parsed = JSON.parse(text);
    return {
      summary: parsed.summary ?? "",
      keyExperiences: parsed.keyExperiences ?? "",
      needsVerification: parsed.needsVerification ?? "",
      aiGenerated: true,
    };
  } catch {
    return {
      summary: "AI 요약 생성 중 오류가 발생했습니다. 답변 원문을 직접 확인해주세요.",
      keyExperiences: "",
      needsVerification: "AI 요약 실패 — 관리자/담당자의 직접 확인이 필요합니다.",
      aiGenerated: false,
    };
  }
}
