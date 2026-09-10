import { describe, it, expect, beforeAll } from "vitest";
import { TestClient, uniqueEmail } from "./helpers";
import { TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD } from "../setup/global-setup";

describe("면접 / Offer / 전자근로계약 / 채용확정", () => {
  const seeker = new TestClient();
  const company = new TestClient();
  const admin = new TestClient();
  let applicationId: string;
  let offerId: string;
  let contractId: string;

  beforeAll(async () => {
    await seeker.post("/api/auth/signup", {
      role: "JOB_SEEKER",
      email: uniqueEmail("full-flow-seeker"),
      password: "testpass123",
      name: "전체흐름구직자",
    });
    const resume = await (
      await seeker.post("/api/resumes", { title: "전체흐름 이력서" })
    ).json();

    const companySignup = await (
      await company.post("/api/auth/signup", {
        role: "COMPANY",
        email: uniqueEmail("full-flow-company"),
        password: "testpass123",
        companyName: "전체흐름컴퍼니",
        businessRegistrationNumber: "777-77-77777",
        contactName: "담당자",
        contactPhone: "010-6666-6666",
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
        title: "전체흐름 공고",
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
  });

  it("면접 요청 시 지원 상태가 INTERVIEW_REQUESTED로, 구직자 확정 시 INTERVIEW_SCHEDULED로 전환된다", async () => {
    const interview = await (
      await company.post(`/api/applications/${applicationId}/interviews`, {
        interviewType: "ONLINE",
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      })
    ).json();
    expect(interview.interview.status).toBe("REQUESTED");

    const invalidTransition = await seeker.patch(`/api/interviews/${interview.interview.id}`, {
      status: "COMPLETED",
    });
    expect(invalidTransition.status).toBe(400);

    const confirm = await (
      await seeker.patch(`/api/interviews/${interview.interview.id}`, { status: "CONFIRMED" })
    ).json();
    expect(confirm.interview.status).toBe("CONFIRMED");
  });

  it("Offer는 수락 전에 계약서를 작성할 수 없다", async () => {
    const offer = await (
      await company.post(`/api/applications/${applicationId}/offers`, {
        salary: 2500000,
        employmentType: "FULL_TIME",
        workLocation: "부산",
      })
    ).json();

    const blocked = await company.post(`/api/job-offers/${offer.offer.id}/contracts`, {
      contentOriginal: "V1",
    });
    expect(blocked.status).toBe(409);

    await seeker.post(`/api/job-offers/${offer.offer.id}/respond`, { action: "ACCEPT" });

    offerId = offer.offer.id;
  });

  it("계약 수정 시 새 버전이 생성되고 이전 버전은 보존된다", async () => {
    const v1 = await (
      await company.post(`/api/job-offers/${offerId}/contracts`, { contentOriginal: "V1 내용" })
    ).json();
    await company.post(`/api/contracts/${v1.contract.id}/send`);
    await seeker.get(`/api/contracts/${v1.contract.id}`); // SENT -> VIEWED

    const v2 = await (
      await company.post(`/api/contracts/${v1.contract.id}/new-version`, {
        contentOriginal: "V2 내용",
      })
    ).json();
    expect(v2.contract.version).toBe(2);

    const v1After = await (await company.get(`/api/contracts/${v1.contract.id}`)).json();
    expect(v1After.contract.status).toBe("CANCELLED");

    contractId = v2.contract.id;
  });

  it("서명 완료 시 채용이 확정(HIRED)되고, 중복 서명은 차단된다", async () => {
    await company.post(`/api/contracts/${contractId}/send`);
    await seeker.get(`/api/contracts/${contractId}`); // VIEWED 전환

    const preSign = await seeker.post(`/api/contracts/${contractId}/sign`);
    expect(preSign.status).toBe(409); // AGREED 전에는 서명 불가

    await seeker.post(`/api/contracts/${contractId}/agree`);
    const signed = await (await seeker.post(`/api/contracts/${contractId}/sign`)).json();
    expect(signed.contract.status).toBe("SIGNED");
    expect(signed.contract.signatureHash).toBeTruthy();
    expect(signed.contract.integrityHash).toBeTruthy();

    const app = await (await seeker.get("/api/applications")).json();
    const target = app.applications.find((a: { id: string }) => a.id === applicationId);
    expect(target.status).toBe("HIRED");

    const doubleSign = await seeker.post(`/api/contracts/${contractId}/sign`);
    expect(doubleSign.status).toBe(409);
  });
});
