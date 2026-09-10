import { describe, it, expect, beforeAll } from "vitest";
import { TestClient, uniqueEmail } from "./helpers";

describe("인재검색 / 스카우트", () => {
  const seeker = new TestClient();
  const company = new TestClient();
  let seekerId: string;

  beforeAll(async () => {
    const signup = await (
      await seeker.post("/api/auth/signup", {
        role: "JOB_SEEKER",
        email: uniqueEmail("talent-seeker"),
        password: "testpass123",
        name: "인재검색대상",
      })
    ).json();
    seekerId = signup.id;

    await company.post("/api/auth/signup", {
      role: "COMPANY",
      email: uniqueEmail("talent-company"),
      password: "testpass123",
      companyName: "인재검색컴퍼니",
      businessRegistrationNumber: "666-66-66666",
      contactName: "담당자",
      contactPhone: "010-5555-5555",
    });
  });

  it("공개 이력서가 없는 구직자는 인재검색 결과에 노출되지 않는다", async () => {
    const res = await (await company.get("/api/company/talents")).json();
    const found = res.talents.some((t: { userId: string }) => t.userId === seekerId);
    expect(found).toBe(false);
  });

  it("공개(PUBLIC)+완료(COMPLETED) 이력서를 등록하면 인재검색에 노출된다", async () => {
    await seeker.patch("/api/seeker/profile", { name: "인재검색대상" });
    const resume = await (
      await seeker.post("/api/resumes", { title: "공개용 이력서" })
    ).json();
    await seeker.patch(`/api/resumes/${resume.resume.id}`, {
      visibility: "PUBLIC",
      status: "COMPLETED",
    });

    const res = await (await company.get("/api/company/talents")).json();
    const found = res.talents.some((t: { userId: string }) => t.userId === seekerId);
    expect(found).toBe(true);
  });

  it("인재 상세 열람 시 talent_view_logs가 기록된다 (200 응답으로 간접 확인)", async () => {
    const res = await company.get(`/api/company/talents/${seekerId}`);
    expect(res.status).toBe(200);
  });

  it("인재를 북마크하고 목록에서 확인할 수 있다", async () => {
    const bookmark = await (
      await company.post(`/api/company/talents/${seekerId}/bookmark`)
    ).json();
    expect(bookmark.bookmarked).toBe(true);

    const list = await (await company.get("/api/company/bookmarks")).json();
    expect(list.bookmarks.length).toBeGreaterThan(0);
  });

  it("스카우트 제안을 보내면 구직자에게 알림이 가고, 수락하면 상태가 ACCEPTED가 된다", async () => {
    const offer = await (
      await company.post("/api/scout-offers", {
        jobSeekerId: seekerId,
        title: "스카우트 제안",
        message: "함께 일해요",
      })
    ).json();
    expect(offer.offer.status).toBe("PENDING");

    const notifs = await (await seeker.get("/api/notifications")).json();
    expect(
      notifs.notifications.some((n: { type: string }) => n.type === "SCOUT_RECEIVED")
    ).toBe(true);

    const respond = await (
      await seeker.post(`/api/scout-offers/${offer.offer.id}/respond`, { action: "ACCEPT" })
    ).json();
    expect(respond.offer.status).toBe("ACCEPTED");

    const respondAgain = await seeker.post(`/api/scout-offers/${offer.offer.id}/respond`, {
      action: "ACCEPT",
    });
    expect(respondAgain.status).toBe(409);
  });
});
