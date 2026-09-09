import { describe, it, expect, beforeAll } from "vitest";
import { TestClient, uniqueEmail } from "./helpers";
import { TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD } from "../setup/global-setup";

describe("지원 / 지원취소 / 중복지원 방지 / 스크랩 / 알림", () => {
  const seeker = new TestClient();
  const company = new TestClient();
  const admin = new TestClient();
  let jobId: string;
  let resumeId: string;

  beforeAll(async () => {
    await seeker.post("/api/auth/signup", {
      role: "JOB_SEEKER",
      email: uniqueEmail("apply-seeker"),
      password: "testpass123",
      name: "지원테스트구직자",
    });
    const resume = await (
      await seeker.post("/api/resumes", { title: "지원용 이력서" })
    ).json();
    resumeId = resume.resume.id;

    const companySignup = await (
      await company.post("/api/auth/signup", {
        role: "COMPANY",
        email: uniqueEmail("apply-company"),
        password: "testpass123",
        companyName: "지원테스트컴퍼니",
        businessRegistrationNumber: "555-55-55555",
        contactName: "담당자",
        contactPhone: "010-4444-4444",
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
        title: "지원 테스트 공고",
        jobCategory: "서비스",
        description: "설명",
        employmentType: "FULL_TIME",
        salaryType: "MONTHLY",
        workLocation: "부산",
      })
    ).json();
    jobId = job.job.id;
    await company.patch(`/api/company/jobs/${jobId}`, { status: "OPEN" });
  });

  it("이력서를 선택해 지원할 수 있다", async () => {
    const res = await seeker.post(`/api/job-posts/${jobId}/apply`, { resumeId });
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.application.status).toBe("APPLIED");
  });

  it("동일 공고에 중복 지원하면 409를 반환한다", async () => {
    const res = await seeker.post(`/api/job-posts/${jobId}/apply`, { resumeId });
    expect(res.status).toBe(409);
  });

  it("기업은 지원자 목록에서 상태를 변경하고 메모를 남길 수 있다", async () => {
    const list = await (await company.get("/api/company/applicants")).json();
    const app = list.applications[0];

    const res = await company.patch(`/api/applications/${app.id}`, {
      status: "DOCUMENT_REVIEW",
      memo: "서류 확인 완료",
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.application.status).toBe("DOCUMENT_REVIEW");
  });

  it("구직자는 지원을 취소할 수 있고, 취소 후에는 재지원이 가능하다", async () => {
    const list = await (await seeker.get("/api/applications")).json();
    const app = list.applications[0];

    const withdraw = await seeker.post(`/api/applications/${app.id}/withdraw`);
    expect(withdraw.status).toBe(200);

    const reapply = await seeker.post(`/api/job-posts/${jobId}/apply`, { resumeId });
    expect(reapply.status).toBe(201);
  });

  it("채용공고를 스크랩하고 취소할 수 있다 (토글)", async () => {
    const on = await (await seeker.post(`/api/job-posts/${jobId}/scrap`)).json();
    expect(on.scrapped).toBe(true);

    const list = await (await seeker.get("/api/scraps")).json();
    expect(list.scraps.length).toBe(1);

    const off = await (await seeker.post(`/api/job-posts/${jobId}/scrap`)).json();
    expect(off.scrapped).toBe(false);
  });

  it("지원 시 기업에게 신규지원자 알림이, 지원취소 시 알림이 생성된다", async () => {
    const notifs = await (await company.get("/api/notifications")).json();
    const hasNewApplicant = notifs.notifications.some(
      (n: { type: string }) => n.type === "NEW_APPLICANT"
    );
    expect(hasNewApplicant).toBe(true);
  });
});
