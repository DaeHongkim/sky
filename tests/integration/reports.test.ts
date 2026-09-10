import { describe, it, expect, beforeAll } from "vitest";
import { TestClient, uniqueEmail } from "./helpers";
import { TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD } from "../setup/global-setup";

describe("신고 접수 / 관리자 처리", () => {
  const seeker = new TestClient();
  const admin = new TestClient();
  let reportId: string;

  beforeAll(async () => {
    await seeker.post("/api/auth/signup", {
      role: "JOB_SEEKER",
      email: uniqueEmail("report-seeker"),
      password: "testpass123",
      name: "신고테스트",
    });
    await admin.post("/api/auth/login", {
      email: TEST_ADMIN_EMAIL,
      password: TEST_ADMIN_PASSWORD,
    });
  });

  it("인증 없이 신고할 수 없다", async () => {
    const res = await new TestClient().post("/api/reports", {
      targetType: "JOB_POST",
      targetId: "x",
      reason: "테스트",
    });
    expect(res.status).toBe(401);
  });

  it("구직자가 채용공고를 신고할 수 있다", async () => {
    const res = await (
      await seeker.post("/api/reports", {
        targetType: "JOB_POST",
        targetId: "some-job-post-id",
        reason: "허위 채용공고로 의심됩니다.",
      })
    ).json();
    expect(res.report.status).toBe("PENDING");
    reportId = res.report.id;
  });

  it("일반 회원은 신고를 처리할 수 없다", async () => {
    const res = await seeker.patch(`/api/admin/reports/${reportId}`, { status: "REVIEWED" });
    expect(res.status).toBe(403);
  });

  it("관리자는 신고 목록을 조회하고 처리할 수 있다", async () => {
    const list = await (await admin.get("/api/admin/reports?status=PENDING")).json();
    expect(list.reports.some((r: { id: string }) => r.id === reportId)).toBe(true);

    const reviewed = await (
      await admin.patch(`/api/admin/reports/${reportId}`, {
        status: "REVIEWED",
        reviewNote: "확인 결과 문제 없음",
      })
    ).json();
    expect(reviewed.report.status).toBe("REVIEWED");

    const again = await admin.patch(`/api/admin/reports/${reportId}`, { status: "DISMISSED" });
    expect(again.status).toBe(409);
  });
});
