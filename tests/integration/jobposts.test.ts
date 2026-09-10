import { describe, it, expect, beforeAll } from "vitest";
import { TestClient, uniqueEmail } from "./helpers";
import { TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD } from "../setup/global-setup";

describe("채용공고 CRUD / 상태전이 / 기업인증 게이트", () => {
  const company = new TestClient();
  const admin = new TestClient();
  let companyUserId: string;

  beforeAll(async () => {
    const signup = await company.post("/api/auth/signup", {
      role: "COMPANY",
      email: uniqueEmail("jobpost-company"),
      password: "testpass123",
      companyName: "공고테스트컴퍼니",
      businessRegistrationNumber: "333-33-33333",
      contactName: "담당자",
      contactPhone: "010-2222-2222",
    });
    const signupData = await signup.json();
    companyUserId = signupData.id;

    await admin.post("/api/auth/login", {
      email: TEST_ADMIN_EMAIL,
      password: TEST_ADMIN_PASSWORD,
    });
  });

  it("공고를 등록하면 DRAFT 상태로 생성된다", async () => {
    const res = await company.post("/api/company/jobs", {
      title: "테스트 채용공고",
      jobCategory: "서비스",
      description: "테스트용 설명입니다.",
      employmentType: "PART_TIME",
      salaryType: "HOURLY",
      workLocation: "부산",
    });
    const data = await res.json();
    expect(res.status).toBe(201);
    expect(data.job.status).toBe("DRAFT");
  });

  it("기업 인증(VERIFIED) 전에는 공고를 게시(OPEN)할 수 없다", async () => {
    const jobs = await (await company.get("/api/company/jobs")).json();
    const job = jobs.jobs[0];

    const res = await company.patch(`/api/company/jobs/${job.id}`, { status: "OPEN" });
    expect(res.status).toBe(403);
  });

  it("관리자가 기업을 인증하면 이후 공고를 게시할 수 있다", async () => {
    const verify = await admin.patch(`/api/admin/companies/${companyUserId}`, {
      verificationStatus: "VERIFIED",
    });
    expect(verify.status).toBe(200);

    const jobs = await (await company.get("/api/company/jobs")).json();
    const job = jobs.jobs[0];
    const openRes = await company.patch(`/api/company/jobs/${job.id}`, { status: "OPEN" });
    expect(openRes.status).toBe(200);

    const publicList = await new TestClient().get("/recruit/jobs");
    expect(publicList.status).toBe(200);
  });

  it("공고를 마감(CLOSED)한 뒤 재오픈(OPEN)할 수 있다", async () => {
    const jobs = await (await company.get("/api/company/jobs")).json();
    const job = jobs.jobs.find((j: { status: string }) => j.status === "OPEN");

    const closeRes = await company.patch(`/api/company/jobs/${job.id}`, { status: "CLOSED" });
    expect((await closeRes.json()).job.status).toBe("CLOSED");

    const reopenRes = await company.patch(`/api/company/jobs/${job.id}`, { status: "OPEN" });
    expect((await reopenRes.json()).job.status).toBe("OPEN");
  });

  it("공고를 복제하면 DRAFT 상태의 새 공고가 생성된다", async () => {
    const jobs = await (await company.get("/api/company/jobs")).json();
    const job = jobs.jobs[0];

    const dup = await (await company.post(`/api/company/jobs/${job.id}/duplicate`)).json();
    expect(dup.job.status).toBe("DRAFT");
    expect(dup.job.title).toContain("복사본");
  });

  it("타 기업/구직자는 남의 공고를 수정할 수 없다", async () => {
    const otherCompany = new TestClient();
    await otherCompany.post("/api/auth/signup", {
      role: "COMPANY",
      email: uniqueEmail("other-company"),
      password: "testpass123",
      companyName: "타사",
      businessRegistrationNumber: "444-44-44444",
      contactName: "담당자",
      contactPhone: "010-3333-3333",
    });
    const jobs = await (await company.get("/api/company/jobs")).json();
    const job = jobs.jobs[0];

    const res = await otherCompany.patch(`/api/company/jobs/${job.id}`, { status: "CLOSED" });
    expect(res.status).toBe(404);
  });
});
