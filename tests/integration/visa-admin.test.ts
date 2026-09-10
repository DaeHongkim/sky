import { describe, it, expect, beforeAll } from "vitest";
import { TestClient, uniqueEmail } from "./helpers";
import { TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD } from "../setup/global-setup";

describe("비자정보 / 관리자 권한", () => {
  const seeker = new TestClient();
  const admin = new TestClient();
  let seekerId: string;

  beforeAll(async () => {
    const signup = await (
      await seeker.post("/api/auth/signup", {
        role: "JOB_SEEKER",
        email: uniqueEmail("visa-seeker"),
        password: "testpass123",
        name: "비자테스트",
      })
    ).json();
    seekerId = signup.id;

    await admin.post("/api/auth/login", {
      email: TEST_ADMIN_EMAIL,
      password: TEST_ADMIN_PASSWORD,
    });
  });

  it("비자정보를 등록하면 AI_ESTIMATED 상태이고 취업허용은 false다", async () => {
    const res = await (
      await seeker.patch("/api/seeker/visa", {
        visaType: "F-4",
        visaStatus: "재류중",
      })
    ).json();
    expect(res.profile.verificationStatus).toBe("AI_ESTIMATED");
    expect(res.profile.employmentAllowed).toBe(false);
  });

  it("일반 회원은 비자 관리자 인증 API를 호출할 수 없다", async () => {
    const res = await seeker.patch(`/api/admin/visa/${seekerId}`, {
      verificationStatus: "ADMIN_VERIFIED",
      employmentAllowed: true,
    });
    expect(res.status).toBe(403);
  });

  it("관리자가 비자를 확인 완료 처리할 수 있다", async () => {
    const res = await (
      await admin.patch(`/api/admin/visa/${seekerId}`, {
        verificationStatus: "ADMIN_VERIFIED",
        employmentAllowed: true,
      })
    ).json();
    expect(res.profile.verificationStatus).toBe("ADMIN_VERIFIED");
    expect(res.profile.employmentAllowed).toBe(true);
  });

  it("본인이 비자정보를 다시 수정하면 확인상태가 AI_ESTIMATED로 리셋된다", async () => {
    const res = await (
      await seeker.patch("/api/seeker/visa", {
        visaType: "F-4",
        visaStatus: "재류중(수정)",
      })
    ).json();
    expect(res.profile.verificationStatus).toBe("AI_ESTIMATED");
    expect(res.profile.employmentAllowed).toBe(false);
  });

  it("관리자는 회원 목록을 조회하고 계정을 정지/해제할 수 있다", async () => {
    const list = await (await admin.get("/api/admin/users?role=JOB_SEEKER")).json();
    expect(list.users.some((u: { id: string }) => u.id === seekerId)).toBe(true);

    const suspend = await admin.patch(`/api/admin/users/${seekerId}`, { status: "SUSPENDED" });
    expect(suspend.status).toBe(200);

    const meAfterSuspend = await seeker.get("/api/auth/me");
    const data = await meAfterSuspend.json();
    expect(data.user).toBeNull();

    const reactivate = await admin.patch(`/api/admin/users/${seekerId}`, { status: "ACTIVE" });
    expect(reactivate.status).toBe(200);
  });
});
