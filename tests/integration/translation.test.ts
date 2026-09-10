import { describe, it, expect } from "vitest";
import { TestClient, uniqueEmail } from "./helpers";

describe("AI 번역 (API 키 미설정 상태)", () => {
  it("인증 없이 번역 요청 시 401을 반환한다", async () => {
    const client = new TestClient();
    const res = await client.post("/api/translations", {
      text: "테스트",
      targetLanguage: "en",
      sourceType: "JOB_POST",
      sourceId: "x",
    });
    expect(res.status).toBe(401);
  });

  it("OPENAI_API_KEY가 없으면 번역 실패를 숨기지 않고 원문 그대로 translated:false로 응답한다", async () => {
    const client = new TestClient();
    await client.post("/api/auth/signup", {
      role: "JOB_SEEKER",
      email: uniqueEmail("translate-user"),
      password: "testpass123",
      name: "번역테스트",
    });

    const res = await client.post("/api/translations", {
      text: "번역 실패 테스트 문장",
      targetLanguage: "en",
      sourceType: "JOB_POST",
      sourceId: "test-source-id",
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.translated).toBe(false);
    expect(data.translatedText).toBe("번역 실패 테스트 문장");
    expect(data.provider).toBe("none");
  });
});
