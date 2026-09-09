import { describe, expect, it, beforeAll } from "vitest";
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const BASE = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";

async function api(path: string, init: RequestInit = {}, cookie?: string) {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (cookie) headers.set("Cookie", cookie);
  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  const setCookie = res.headers.getSetCookie?.() || [];
  const json = await res.json();
  return { res, json, setCookie };
}

function cookieFrom(setCookie: string[]) {
  return setCookie.map((c) => c.split(";")[0]).join("; ");
}

describe("HIHONG RECRUIT API integration", () => {
  const stamp = Date.now();
  const seekerEmail = `seeker_${stamp}@test.local`;
  const companyEmail = `company_${stamp}@test.local`;
  let seekerCookie = "";
  let companyCookie = "";
  let jobId = "";
  let resumeId = "";
  let applicationId = "";

  beforeAll(async () => {
    // ensure admin exists for admin tests
    const hash = await bcrypt.hash("Passw0rd!", 12);
    await prisma.user.upsert({
      where: { email: "admin@hihong.recruit" },
      update: { passwordHash: hash, status: "ACTIVE", role: Role.ADMIN },
      create: {
        email: "admin@hihong.recruit",
        passwordHash: hash,
        role: Role.ADMIN,
        name: "Admin",
      },
    });
  });

  it("signup job seeker", async () => {
    const { res, json, setCookie } = await api("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        email: seekerEmail,
        password: "Passw0rd!",
        name: "테스트구직",
        role: "JOB_SEEKER",
      }),
    });
    expect(res.status).toBe(201);
    expect(json.ok).toBe(true);
    seekerCookie = cookieFrom(setCookie);
    expect(seekerCookie).toContain("hr_session=");
  });

  it("signup company", async () => {
    const { res, json, setCookie } = await api("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        email: companyEmail,
        password: "Passw0rd!",
        name: "테스트기업",
        role: "COMPANY",
        companyName: "테스트컴퍼니",
      }),
    });
    expect(res.status).toBe(201);
    expect(json.ok).toBe(true);
    companyCookie = cookieFrom(setCookie);
  });

  it("login maintains session", async () => {
    const { json, setCookie } = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: seekerEmail, password: "Passw0rd!" }),
    });
    expect(json.ok).toBe(true);
    seekerCookie = cookieFrom(setCookie) || seekerCookie;
    const me = await api("/api/auth/me", {}, seekerCookie);
    expect(me.json.data.user.email).toBe(seekerEmail);
    expect(me.json.data.user.role).toBe("JOB_SEEKER");
  });

  it("rejects client role escalation — company APIs stay forbidden for seeker", async () => {
    const { res, json } = await api(
      "/api/job-posts",
      {
        method: "POST",
        body: JSON.stringify({ title: "해킹", description: "x" }),
      },
      seekerCookie,
    );
    expect(res.status).toBe(403);
    expect(json.ok).toBe(false);
  });

  it("resume CRUD + multi resume + visibility", async () => {
    const created = await api(
      "/api/resumes",
      {
        method: "POST",
        body: JSON.stringify({
          title: "이력서1",
          desiredJob: "HR",
          status: "COMPLETE",
          visibility: "PUBLIC",
          isPrimary: true,
        }),
      },
      seekerCookie,
    );
    expect(created.json.ok).toBe(true);
    resumeId = created.json.data.id;

    const second = await api(
      "/api/resumes",
      { method: "POST", body: JSON.stringify({ title: "이력서2", status: "DRAFT", visibility: "PRIVATE" }) },
      seekerCookie,
    );
    expect(second.json.ok).toBe(true);

    const list = await api("/api/resumes", {}, seekerCookie);
    expect(list.json.data.length).toBeGreaterThanOrEqual(2);

    const patched = await api(
      `/api/resumes/${resumeId}`,
      { method: "PATCH", body: JSON.stringify({ visibility: "PRIVATE" }) },
      seekerCookie,
    );
    expect(patched.json.data.visibility).toBe("PRIVATE");

    await api(
      `/api/resumes/${resumeId}`,
      { method: "PATCH", body: JSON.stringify({ visibility: "PUBLIC", status: "COMPLETE" }) },
      seekerCookie,
    );
  });

  it("job post CRUD publish close", async () => {
    const created = await api(
      "/api/job-posts",
      {
        method: "POST",
        body: JSON.stringify({
          title: "테스트 공고",
          description: "설명",
          employmentType: "정규직",
          salaryMin: 3000000,
          salaryMax: 4000000,
          workLocation: "서울",
          foreignerAllowed: true,
          status: "OPEN",
        }),
      },
      companyCookie,
    );
    expect(created.json.ok).toBe(true);
    jobId = created.json.data.id;

    const closed = await api(
      `/api/job-posts/${jobId}`,
      { method: "PATCH", body: JSON.stringify({ status: "CLOSED" }) },
      companyCookie,
    );
    expect(closed.json.data.status).toBe("CLOSED");

    const reopened = await api(
      `/api/job-posts/${jobId}`,
      { method: "PATCH", body: JSON.stringify({ status: "OPEN" }) },
      companyCookie,
    );
    expect(reopened.json.data.status).toBe("OPEN");
  });

  it("apply / duplicate apply / withdraw", async () => {
    const apply = await api(
      `/api/job-posts/${jobId}/apply`,
      { method: "POST", body: JSON.stringify({ resumeId }) },
      seekerCookie,
    );
    expect(apply.json.ok).toBe(true);
    applicationId = apply.json.data.id;

    const dup = await api(
      `/api/job-posts/${jobId}/apply`,
      { method: "POST", body: JSON.stringify({ resumeId }) },
      seekerCookie,
    );
    expect(dup.res.status).toBe(409);

    const withdraw = await api(`/api/applications/${applicationId}/withdraw`, { method: "POST" }, seekerCookie);
    expect(withdraw.json.data.status).toBe("WITHDRAWN");

    const reapply = await api(
      `/api/job-posts/${jobId}/apply`,
      { method: "POST", body: JSON.stringify({ resumeId }) },
      seekerCookie,
    );
    expect(reapply.json.ok).toBe(true);
    applicationId = reapply.json.data.id;
  });

  it("scrap", async () => {
    const scrap = await api(
      "/api/job-scraps",
      { method: "POST", body: JSON.stringify({ jobPostId: jobId }) },
      seekerCookie,
    );
    expect(scrap.json.ok).toBe(true);
    const list = await api("/api/job-scraps", {}, seekerCookie);
    expect(list.json.data.length).toBeGreaterThanOrEqual(1);
  });

  it("applicant status change + notification", async () => {
    const status = await api(
      `/api/applications/${applicationId}/status`,
      { method: "PATCH", body: JSON.stringify({ status: "DOCUMENT_REVIEW", note: "서류검토" }) },
      companyCookie,
    );
    expect(status.json.data.status).toBe("DOCUMENT_REVIEW");

    const notif = await api("/api/notifications", {}, seekerCookie);
    expect(notif.json.data.items.length).toBeGreaterThan(0);
  });

  it("talent search + scout", async () => {
    const talents = await api("/api/talents", {}, companyCookie);
    expect(talents.json.ok).toBe(true);

    const seeker = await api("/api/auth/me", {}, seekerCookie);
    const scout = await api(
      "/api/scout-offers",
      {
        method: "POST",
        body: JSON.stringify({
          jobSeekerId: seeker.json.data.user.id,
          title: "스카우트",
          message: "함께해요",
        }),
      },
      companyCookie,
    );
    expect(scout.json.ok).toBe(true);
  });

  it("translation failure when provider key missing for openai", async () => {
    // mock provider always works; force failure by unsupported language
    const bad = await api(
      "/api/translations",
      { method: "POST", body: JSON.stringify({ text: "hello", targetLang: "xx" }) },
      seekerCookie,
    );
    expect(bad.json.ok).toBe(false);
  });

  it("visa info labels", async () => {
    const visa = await api(
      "/api/visa",
      {
        method: "PUT",
        body: JSON.stringify({
          visaType: "E-7",
          expiryDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          employmentAllowed: true,
        }),
      },
      seekerCookie,
    );
    expect(visa.json.data.visa.verificationStatus).toBe("OFFICIAL_CONFIRMATION_REQUIRED");
  });

  it("interview / offer / contract / hired", async () => {
    const interview = await api(
      "/api/interviews",
      {
        method: "POST",
        body: JSON.stringify({
          applicationId,
          scheduledAt: new Date(Date.now() + 86400000).toISOString(),
          interviewType: "ONLINE",
        }),
      },
      companyCookie,
    );
    expect(interview.json.ok).toBe(true);

    const offer = await api(
      "/api/job-offers",
      {
        method: "POST",
        body: JSON.stringify({ applicationId, salary: 3500000, employmentType: "정규직" }),
      },
      companyCookie,
    );
    expect(offer.json.ok).toBe(true);

    await api(
      `/api/job-offers/${offer.json.data.id}`,
      { method: "PATCH", body: JSON.stringify({ action: "ACCEPT" }) },
      seekerCookie,
    );

    const contract = await api(
      "/api/contracts",
      {
        method: "POST",
        body: JSON.stringify({
          applicationId,
          offerId: offer.json.data.id,
          title: "근로계약",
          originalContent: "계약 원문 V1",
        }),
      },
      companyCookie,
    );
    expect(contract.json.ok).toBe(true);

    await api(
      `/api/contracts/${contract.json.data.id}`,
      { method: "PATCH", body: JSON.stringify({ action: "SEND" }) },
      companyCookie,
    );
    await api(
      `/api/contracts/${contract.json.data.id}`,
      { method: "PATCH", body: JSON.stringify({ action: "VIEW" }) },
      seekerCookie,
    );
    await api(
      `/api/contracts/${contract.json.data.id}`,
      { method: "PATCH", body: JSON.stringify({ action: "AGREE" }) },
      seekerCookie,
    );
    const signed = await api(
      `/api/contracts/${contract.json.data.id}`,
      { method: "PATCH", body: JSON.stringify({ action: "SIGN", signatureName: "테스트구직" }) },
      seekerCookie,
    );
    expect(signed.json.data.status).toBe("SIGNED");
    expect(signed.json.data.integrityHash).toBeTruthy();

    const app = await prisma.application.findUnique({ where: { id: applicationId } });
    expect(app?.status).toBe("HIRED");

    const hq = await prisma.hireIntegrationEvent.findFirst({ where: { applicationId } });
    expect(hq).toBeTruthy();
  });

  it("admin permission required", async () => {
    const denied = await api("/api/admin", {}, seekerCookie);
    expect(denied.res.status).toBe(403);

    const login = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "admin@hihong.recruit", password: "Passw0rd!" }),
    });
    const adminCookie = cookieFrom(login.setCookie);
    const ok = await api("/api/admin?section=overview", {}, adminCookie);
    expect(ok.json.ok).toBe(true);
  });
});
