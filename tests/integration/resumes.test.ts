import { describe, it, expect, beforeAll } from "vitest";
import { TestClient, uniqueEmail } from "./helpers";

describe("이력서 CRUD / 다중이력서 / 공개범위", () => {
  const seeker = new TestClient();
  const otherSeeker = new TestClient();
  const company = new TestClient();

  beforeAll(async () => {
    await seeker.post("/api/auth/signup", {
      role: "JOB_SEEKER",
      email: uniqueEmail("resume-owner"),
      password: "testpass123",
      name: "이력서주인",
    });
    await otherSeeker.post("/api/auth/signup", {
      role: "JOB_SEEKER",
      email: uniqueEmail("resume-other"),
      password: "testpass123",
      name: "다른구직자",
    });
    await company.post("/api/auth/signup", {
      role: "COMPANY",
      email: uniqueEmail("resume-company"),
      password: "testpass123",
      companyName: "이력서테스트컴퍼니",
      businessRegistrationNumber: "222-22-22222",
      contactName: "담당자",
      contactPhone: "010-1111-1111",
    });
  });

  it("이력서를 여러 개 생성할 수 있고 첫 번째가 자동으로 대표 이력서가 된다", async () => {
    const res1 = await seeker.post("/api/resumes", { title: "이력서1" });
    const data1 = await res1.json();
    expect(res1.status).toBe(201);
    expect(data1.resume.isPrimary).toBe(true);

    const res2 = await seeker.post("/api/resumes", { title: "이력서2" });
    const data2 = await res2.json();
    expect(data2.resume.isPrimary).toBe(false);

    const list = await seeker.get("/api/resumes");
    const listData = await list.json();
    expect(listData.resumes.length).toBe(2);
  });

  it("대표 이력서를 변경하면 기존 대표는 해제된다", async () => {
    const list = await seeker.get("/api/resumes");
    const { resumes } = await list.json();
    const nonPrimary = resumes.find((r: { isPrimary: boolean }) => !r.isPrimary);

    await seeker.post(`/api/resumes/${nonPrimary.id}/primary`);
    const after = await (await seeker.get("/api/resumes")).json();
    const primaryCount = after.resumes.filter((r: { isPrimary: boolean }) => r.isPrimary).length;
    expect(primaryCount).toBe(1);
    expect(after.resumes.find((r: { id: string }) => r.id === nonPrimary.id).isPrimary).toBe(true);
  });

  it("비공개(PRIVATE) 이력서는 타인이 조회할 수 없다 (403)", async () => {
    const created = await (await seeker.post("/api/resumes", { title: "비공개 이력서" })).json();
    const resumeId = created.resume.id;

    const forbidden = await otherSeeker.get(`/api/resumes/${resumeId}`);
    expect(forbidden.status).toBe(403);
  });

  it("공개(PUBLIC)+완료(COMPLETED) 이력서는 타인도 조회할 수 있다", async () => {
    const created = await (await seeker.post("/api/resumes", { title: "공개 이력서" })).json();
    const resumeId = created.resume.id;

    await seeker.patch(`/api/resumes/${resumeId}`, {
      visibility: "PUBLIC",
      status: "COMPLETED",
      profileSummary: "공개 테스트용 이력서",
    });

    const viewed = await company.get(`/api/resumes/${resumeId}`);
    expect(viewed.status).toBe(200);
  });

  it("이력서 하위 항목(경력/언어)이 실제로 저장된다", async () => {
    const created = await (await seeker.post("/api/resumes", { title: "경력 테스트" })).json();
    const resumeId = created.resume.id;

    const patched = await seeker.patch(`/api/resumes/${resumeId}`, {
      careers: [
        { companyName: "이전회사", position: "바리스타", isCurrent: false },
      ],
      languages: [{ language: "영어", level: "INTERMEDIATE" }],
    });
    const data = await patched.json();
    expect(data.resume.careers.length).toBe(1);
    expect(data.resume.languages.length).toBe(1);
    expect(data.resume.careers[0].companyName).toBe("이전회사");
  });

  it("이력서를 복제하면 새 이력서가 비공개/작성중 상태로 생성된다", async () => {
    const created = await (
      await seeker.post("/api/resumes", { title: "복제원본" })
    ).json();
    await seeker.patch(`/api/resumes/${created.resume.id}`, {
      visibility: "PUBLIC",
      status: "COMPLETED",
    });

    const dup = await (
      await seeker.post(`/api/resumes/${created.resume.id}/duplicate`)
    ).json();
    expect(dup.resume.visibility).toBe("PRIVATE");
    expect(dup.resume.status).toBe("DRAFT");
    expect(dup.resume.title).toContain("복사본");
  });

  it("이력서를 삭제할 수 있고, 대표 이력서 삭제 시 다른 이력서가 대표로 승계된다", async () => {
    const before = await (await seeker.get("/api/resumes")).json();
    const primary = before.resumes.find((r: { isPrimary: boolean }) => r.isPrimary);

    const del = await seeker.delete(`/api/resumes/${primary.id}`);
    expect(del.status).toBe(200);

    const after = await (await seeker.get("/api/resumes")).json();
    const stillHasPrimary = after.resumes.some((r: { isPrimary: boolean }) => r.isPrimary);
    expect(stillHasPrimary).toBe(true);
  });
});
