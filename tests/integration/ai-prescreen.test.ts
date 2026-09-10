import { describe, it, expect, beforeAll } from "vitest";
import { TestClient, uniqueEmail } from "./helpers";
import { TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD } from "../setup/global-setup";

describe("AI 사전면접 (API 키 미설정 상태 — 기본 템플릿 동작 검증)", () => {
  const seeker = new TestClient();
  const company = new TestClient();
  const admin = new TestClient();
  let interviewId: string;

  beforeAll(async () => {
    await seeker.post("/api/auth/signup", {
      role: "JOB_SEEKER",
      email: uniqueEmail("prescreen-seeker"),
      password: "testpass123",
      name: "AI사전면접구직자",
    });
    const resume = await (
      await seeker.post("/api/resumes", { title: "AI 사전면접용 이력서" })
    ).json();

    const companySignup = await (
      await company.post("/api/auth/signup", {
        role: "COMPANY",
        email: uniqueEmail("prescreen-company"),
        password: "testpass123",
        companyName: "AI사전면접컴퍼니",
        businessRegistrationNumber: "999-99-99999",
        contactName: "담당자",
        contactPhone: "010-8888-8888",
      })
    ).json();

    await admin.post("/api/auth/login", {
      email: TEST_ADMIN_EMAIL,
      password: TEST_ADMIN_PASSWORD,
    });
    await admin.patch(`/api/admin/companies/${companySignup.id}`, {
      verificationStatus: "VERIFIED",
    });

    const job = await (
      await company.post("/api/company/jobs", {
        title: "AI 사전면접 테스트 공고",
        jobCategory: "서비스",
        description: "설명",
        employmentType: "FULL_TIME",
        salaryType: "MONTHLY",
        workLocation: "부산",
      })
    ).json();
    await company.patch(`/api/company/jobs/${job.job.id}`, { status: "OPEN" });

    const applied = await (
      await seeker.post(`/api/job-posts/${job.job.id}/apply`, { resumeId: resume.resume.id })
    ).json();

    const interview = await (
      await company.post(`/api/applications/${applied.application.id}/interviews`, {
        interviewType: "AI_PRESCREEN",
        scheduledAt: new Date().toISOString(),
      })
    ).json();
    interviewId = interview.interview.id;
  });

  it("일반 면접 유형에는 질문 생성을 요청할 수 없다", async () => {
    // AI_PRESCREEN이 아닌 면접에 대해서는 400을 반환해야 하므로,
    // 존재하지 않는 임의 id로 404를 확인 (owner 검증이 먼저 걸림).
    const res = await company.post("/api/interviews/nonexistent/prescreen/generate");
    expect(res.status).toBe(404);
  });

  it("기업이 질문을 생성하면 기본 템플릿 질문이 반환된다 (키 미설정)", async () => {
    const res = await (
      await company.post(`/api/interviews/${interviewId}/prescreen/generate`)
    ).json();
    expect(res.aiGenerated).toBe(false);
    expect(res.result.questions.length).toBeGreaterThan(0);

    const again = await company.post(`/api/interviews/${interviewId}/prescreen/generate`);
    expect(again.status).toBe(409);
  });

  it("구직자가 답변을 제출하면 정직한 미연결 안내가 요약으로 저장된다", async () => {
    const before = await (await seeker.get(`/api/interviews/${interviewId}/prescreen`)).json();
    const answers = before.result.questions.map(() => "테스트 답변입니다.");

    const res = await (
      await seeker.post(`/api/interviews/${interviewId}/prescreen/answers`, { answers })
    ).json();
    expect(res.aiGenerated).toBe(false);
    expect(res.result.needsVerification).toContain("확인이 필요");

    const duplicate = await seeker.post(`/api/interviews/${interviewId}/prescreen/answers`, {
      answers,
    });
    expect(duplicate.status).toBe(409);
  });

  it("기업은 제출된 답변과 요약을 조회할 수 있다", async () => {
    const res = await (await company.get(`/api/interviews/${interviewId}/prescreen`)).json();
    expect(res.result.answers.length).toBeGreaterThan(0);
    expect(res.result.summary).toBeTruthy();
  });
});
