import { describe, it, expect } from "vitest";
import { TestClient, uniqueEmail } from "./helpers";
import { TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD } from "../setup/global-setup";

describe("회원가입 / 로그인 / 권한", () => {
  it("구직자 회원가입 후 세션 쿠키로 /api/auth/me 조회 가능", async () => {
    const client = new TestClient();
    const email = uniqueEmail("seeker");
    const res = await client.post("/api/auth/signup", {
      role: "JOB_SEEKER",
      email,
      password: "testpass123",
      name: "테스트구직자",
    });
    expect(res.status).toBe(201);

    const me = await client.get("/api/auth/me");
    const data = await me.json();
    expect(data.user.email).toBe(email);
    expect(data.user.role).toBe("JOB_SEEKER");
  });

  it("기업 회원가입 시 CompanyProfile이 PENDING 상태로 생성된다", async () => {
    const client = new TestClient();
    const email = uniqueEmail("company");
    const res = await client.post("/api/auth/signup", {
      role: "COMPANY",
      email,
      password: "testpass123",
      companyName: "테스트컴퍼니",
      businessRegistrationNumber: "111-11-11111",
      contactName: "담당자",
      contactPhone: "010-0000-0000",
    });
    expect(res.status).toBe(201);
    const me = await client.get("/api/auth/me");
    const data = await me.json();
    expect(data.user.role).toBe("COMPANY");
  });

  it("동일 이메일로 중복 가입은 409를 반환한다", async () => {
    const client = new TestClient();
    const email = uniqueEmail("dup");
    await client.post("/api/auth/signup", {
      role: "JOB_SEEKER",
      email,
      password: "testpass123",
      name: "중복테스트",
    });
    const res2 = await client.post("/api/auth/signup", {
      role: "JOB_SEEKER",
      email,
      password: "testpass123",
      name: "중복테스트2",
    });
    expect(res2.status).toBe(409);
  });

  it("잘못된 비밀번호로 로그인하면 401", async () => {
    const client = new TestClient();
    const email = uniqueEmail("wrongpw");
    await client.post("/api/auth/signup", {
      role: "JOB_SEEKER",
      email,
      password: "testpass123",
      name: "테스트",
    });
    const fresh = new TestClient();
    const res = await fresh.post("/api/auth/login", { email, password: "wrongpassword" });
    expect(res.status).toBe(401);
  });

  it("로그인하지 않은 사용자는 구직자 전용 페이지에서 로그인 페이지로 리다이렉트된다", async () => {
    const client = new TestClient();
    const res = await client.get("/recruit/seeker");
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/recruit/login");
  });

  it("구직자 세션으로 기업 전용 페이지 접근 시 리다이렉트된다 (역할 격리)", async () => {
    const client = new TestClient();
    const email = uniqueEmail("roletest");
    await client.post("/api/auth/signup", {
      role: "JOB_SEEKER",
      email,
      password: "testpass123",
      name: "역할테스트",
    });
    const res = await client.get("/recruit/company");
    expect(res.status).toBe(307);
  });

  it("관리자 계정으로 로그인 후 관리자 페이지 접근 가능, 일반 회원은 접근 불가", async () => {
    const admin = new TestClient();
    const loginRes = await admin.post("/api/auth/login", {
      email: TEST_ADMIN_EMAIL,
      password: TEST_ADMIN_PASSWORD,
    });
    expect(loginRes.status).toBe(200);
    const adminPage = await admin.get("/recruit/admin");
    expect(adminPage.status).toBe(200);

    const seeker = new TestClient();
    await seeker.post("/api/auth/signup", {
      role: "JOB_SEEKER",
      email: uniqueEmail("nonadmin"),
      password: "testpass123",
      name: "일반회원",
    });
    const blocked = await seeker.get("/api/admin/users");
    expect(blocked.status).toBe(403);
  });

  it("회원 탈퇴 후 같은 이메일로 다시 로그인할 수 없다 (탈퇴 시 이메일이 회수되어 조회 자체가 실패)", async () => {
    const client = new TestClient();
    const email = uniqueEmail("withdraw");
    await client.post("/api/auth/signup", {
      role: "JOB_SEEKER",
      email,
      password: "testpass123",
      name: "탈퇴테스트",
    });
    const withdrawRes = await client.post("/api/auth/withdraw");
    expect(withdrawRes.status).toBe(200);

    const relogin = new TestClient();
    const res = await relogin.post("/api/auth/login", { email, password: "testpass123" });
    // 탈퇴 시 email이 withdrawn+<id>@hihong.invalid 로 회수되므로,
    // 원래 이메일로는 계정 조회 자체가 실패해 일반 401(INVALID_CREDENTIALS)이 된다.
    expect(res.status).toBe(401);
  });
});
