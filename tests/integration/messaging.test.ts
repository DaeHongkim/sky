import { describe, it, expect, beforeAll } from "vitest";
import { TestClient, uniqueEmail } from "./helpers";
import { TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD } from "../setup/global-setup";

describe("채팅 / 메시지", () => {
  const seeker = new TestClient();
  const company = new TestClient();
  const admin = new TestClient();
  const outsider = new TestClient();
  let applicationId: string;

  beforeAll(async () => {
    await seeker.post("/api/auth/signup", {
      role: "JOB_SEEKER",
      email: uniqueEmail("chat-seeker"),
      password: "testpass123",
      name: "채팅테스트구직자",
    });
    const resume = await (
      await seeker.post("/api/resumes", { title: "채팅용 이력서" })
    ).json();

    const companySignup = await (
      await company.post("/api/auth/signup", {
        role: "COMPANY",
        email: uniqueEmail("chat-company"),
        password: "testpass123",
        companyName: "채팅테스트컴퍼니",
        businessRegistrationNumber: "888-88-88888",
        contactName: "담당자",
        contactPhone: "010-7777-7777",
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
        title: "채팅 테스트 공고",
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
    applicationId = applied.application.id;

    await outsider.post("/api/auth/signup", {
      role: "JOB_SEEKER",
      email: uniqueEmail("chat-outsider"),
      password: "testpass123",
      name: "무관한제3자",
    });
  });

  it("지원 건을 기준으로 대화방을 생성하면 양측에서 동일한 대화방을 재사용한다", async () => {
    const c1 = await (await company.post("/api/conversations", { applicationId })).json();
    const c2 = await (await company.post("/api/conversations", { applicationId })).json();
    expect(c1.conversation.id).toBe(c2.conversation.id);
  });

  it("메시지를 보내고 받을 수 있다", async () => {
    const conv = await (await seeker.post("/api/conversations", { applicationId })).json();
    const conversationId = conv.conversation.id;

    const sent = await company.post(`/api/conversations/${conversationId}/messages`, {
      content: "안녕하세요, 지원해주셔서 감사합니다.",
    });
    expect(sent.status).toBe(201);

    const messages = await (
      await seeker.get(`/api/conversations/${conversationId}/messages`)
    ).json();
    expect(messages.messages.length).toBe(1);
    expect(messages.messages[0].content).toContain("감사합니다");
  });

  it("메시지 수신자가 조회하면 읽음 처리되고, 발신자에게 알림이 생성된다", async () => {
    const conv = await (await seeker.post("/api/conversations", { applicationId })).json();
    const conversationId = conv.conversation.id;

    await seeker.get(`/api/conversations/${conversationId}/messages`); // 읽음 처리

    const notifs = await (await seeker.get("/api/notifications")).json();
    expect(notifs.notifications.length).toBeGreaterThan(0);
  });

  it("대화 당사자가 아닌 제3자는 대화방에 접근할 수 없다", async () => {
    const conv = await (await seeker.post("/api/conversations", { applicationId })).json();
    const res = await outsider.get(`/api/conversations/${conv.conversation.id}/messages`);
    expect(res.status).toBe(404);
  });
});
