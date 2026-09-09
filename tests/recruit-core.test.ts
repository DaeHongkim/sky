import { describe, it, expect, beforeAll } from "vitest";
import { PrismaClient, Role } from "@prisma/client";
import {
  hashPassword,
  verifyPassword,
  createSessionToken,
  verifySessionToken,
  hashToken,
  generateRawToken,
} from "../src/lib/auth/session";
import { assertRole, isAdminRole } from "../src/lib/permissions/roles";
import { MockTranslationProvider } from "../src/lib/translation/provider";
import { integrityHash } from "../src/lib/integrations/hq/hired";

const prisma = new PrismaClient();

describe("auth crypto", () => {
  it("hashes and verifies passwords", async () => {
    const hash = await hashPassword("Test1234!");
    expect(await verifyPassword("Test1234!", hash)).toBe(true);
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });

  it("creates and verifies session jwt", async () => {
    process.env.AUTH_SECRET = process.env.AUTH_SECRET || "dev-hihong-recruit-change-me-in-production-32chars";
    const { token } = await createSessionToken({
      sub: "user1",
      role: Role.JOB_SEEKER,
      email: "a@b.c",
      sid: "sess1",
    });
    const payload = await verifySessionToken(token);
    expect(payload?.sub).toBe("user1");
    expect(payload?.role).toBe(Role.JOB_SEEKER);
  });

  it("hashes reset tokens stably", () => {
    const raw = generateRawToken();
    expect(hashToken(raw)).toHaveLength(64);
    expect(hashToken(raw)).toBe(hashToken(raw));
  });
});

describe("permissions", () => {
  it("does not allow role escalation by client claim alone", () => {
    expect(isAdminRole(Role.JOB_SEEKER)).toBe(false);
    expect(() => assertRole(Role.JOB_SEEKER, [Role.ADMIN])).toThrow();
    expect(() => assertRole(Role.ADMIN, [Role.ADMIN])).not.toThrow();
  });
});

describe("translation provider", () => {
  it("mock translates and detects korean", async () => {
    const p = new MockTranslationProvider();
    const r = await p.translate({ text: "안녕하세요", targetLang: "en" });
    expect(r.translatedText).toContain("[en]");
    expect(await p.detectLanguage("안녕하세요")).toBe("ko");
  });

  it("fails clearly when openai key missing", async () => {
    const { OpenAITranslationProvider } = await import("../src/lib/translation/provider");
    const prev = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    const p = new OpenAITranslationProvider();
    await expect(p.translate({ text: "hi", targetLang: "ko" })).rejects.toThrow(
      /OPENAI_API_KEY/,
    );
    process.env.OPENAI_API_KEY = prev;
  });
});

describe("db recruitment flow", () => {
  const stamp = Date.now();
  const seekerEmail = `seeker_${stamp}@test.local`;
  const companyEmail = `company_${stamp}@test.local`;

  beforeAll(async () => {
    process.env.AUTH_SECRET =
      process.env.AUTH_SECRET || "dev-hihong-recruit-change-me-in-production-32chars";
  });

  it("supports signup entities, resume CRUD, job post, apply, withdraw, scrap, scout, hire", async () => {
    const passwordHash = await hashPassword("Test1234!");

    const seeker = await prisma.user.create({
      data: {
        email: seekerEmail,
        passwordHash,
        role: Role.JOB_SEEKER,
        name: "테스트구직",
        jobSeekerProfile: {
          create: { name: "테스트구직", nationality: "VN", koreanLevel: "중" },
        },
      },
    });

    const companyUser = await prisma.user.create({
      data: {
        email: companyEmail,
        passwordHash,
        role: Role.COMPANY,
        name: "테스트기업",
        companyProfile: {
          create: {
            companyName: "테스트컴퍼니",
            verificationStatus: "VERIFIED",
          },
        },
      },
      include: { companyProfile: true },
    });

    const resume = await prisma.resume.create({
      data: {
        userId: seeker.id,
        title: "이력서1",
        visibility: "PUBLIC",
        status: "COMPLETE",
        isPrimary: true,
        desiredJob: "서비스",
      },
    });

    const resume2 = await prisma.resume.create({
      data: {
        userId: seeker.id,
        title: "이력서2",
        visibility: "PRIVATE",
        status: "DRAFT",
        isPrimary: false,
      },
    });

    expect(resume2.visibility).toBe("PRIVATE");

    await prisma.resume.updateMany({
      where: { userId: seeker.id },
      data: { isPrimary: false },
    });
    await prisma.resume.update({
      where: { id: resume2.id },
      data: { isPrimary: true },
    });

    const job = await prisma.jobPost.create({
      data: {
        companyId: companyUser.companyProfile!.id,
        title: "테스트 공고",
        status: "OPEN",
        foreignerAllowed: true,
        workLocation: "서울",
      },
    });

    await prisma.jobPost.update({
      where: { id: job.id },
      data: { status: "CLOSED" },
    });
    await prisma.jobPost.update({
      where: { id: job.id },
      data: { status: "OPEN" },
    });

    const dup = await prisma.application.create({
      data: {
        jobPostId: job.id,
        jobSeekerId: seeker.id,
        resumeId: resume.id,
        companyId: companyUser.companyProfile!.id,
        status: "APPLIED",
      },
    });

    await expect(
      prisma.application.create({
        data: {
          jobPostId: job.id,
          jobSeekerId: seeker.id,
          resumeId: resume.id,
          companyId: companyUser.companyProfile!.id,
        },
      }),
    ).rejects.toThrow();

    await prisma.jobScrap.create({
      data: { userId: seeker.id, jobPostId: job.id },
    });
    await expect(
      prisma.jobScrap.create({
        data: { userId: seeker.id, jobPostId: job.id },
      }),
    ).rejects.toThrow();

    await prisma.applicationHistory.create({
      data: {
        applicationId: dup.id,
        fromStatus: "APPLIED",
        toStatus: "DOCUMENT_REVIEW",
        changedById: companyUser.id,
      },
    });

    await prisma.application.update({
      where: { id: dup.id },
      data: { status: "DOCUMENT_REVIEW" },
    });

    const scout = await prisma.scoutOffer.create({
      data: {
        companyId: companyUser.companyProfile!.id,
        jobSeekerId: seeker.id,
        senderUserId: companyUser.id,
        title: "스카우트",
        message: "관심있습니다",
      },
    });
    expect(scout.status).toBe("PENDING");

    await prisma.notification.create({
      data: {
        userId: seeker.id,
        type: "SCOUT",
        title: "스카우트",
      },
    });

    await prisma.visaProfile.create({
      data: {
        userId: seeker.id,
        visaType: "E-7",
        expiryDate: new Date(Date.now() + 30 * 86400000),
        verificationStatus: "NEEDS_OFFICIAL_CHECK",
      },
    });

    const interview = await prisma.interview.create({
      data: {
        applicationId: dup.id,
        companyId: companyUser.companyProfile!.id,
        jobSeekerId: seeker.id,
        jobPostId: job.id,
        status: "REQUESTED",
      },
    });
    expect(interview.status).toBe("REQUESTED");

    const offer = await prisma.jobOffer.create({
      data: {
        applicationId: dup.id,
        companyId: companyUser.companyProfile!.id,
        jobSeekerId: seeker.id,
        salary: 300,
      },
    });

    const contractV1 = await prisma.employmentContract.create({
      data: {
        applicationId: dup.id,
        companyId: companyUser.companyProfile!.id,
        jobSeekerId: seeker.id,
        jobOfferId: offer.id,
        version: 1,
        title: "계약",
        contentOriginal: "원문 계약",
        status: "DRAFT",
      },
    });
    const contractV2 = await prisma.employmentContract.create({
      data: {
        applicationId: dup.id,
        companyId: companyUser.companyProfile!.id,
        jobSeekerId: seeker.id,
        version: 2,
        title: "계약",
        contentOriginal: "원문 계약 v2",
        status: "SENT",
      },
    });
    expect(contractV2.version).toBe(2);

    const hash = integrityHash(contractV1.contentOriginal, {
      version: 1,
      signer: seeker.id,
    });
    await prisma.employmentContract.update({
      where: { id: contractV2.id },
      data: {
        status: "SIGNED",
        signedAt: new Date(),
        signedBySeeker: true,
        integrityHash: hash,
        auditJson: JSON.stringify({ version: 2 }),
      },
    });

    await prisma.application.update({
      where: { id: dup.id },
      data: { status: "WITHDRAWN", withdrawnAt: new Date() },
    });

    // re-apply path via status reset is application-layer concern; hire path:
    await prisma.application.update({
      where: { id: dup.id },
      data: { status: "HIRED", withdrawnAt: null },
    });

    const outbox = await prisma.integrationOutbox.create({
      data: {
        eventType: "HireCompleted",
        payloadJson: JSON.stringify({ event: "HIRED", applicationId: dup.id }),
      },
    });
    expect(outbox.status).toBe("PENDING");

    const publicOnly = await prisma.resume.findMany({
      where: { visibility: "PUBLIC", status: "COMPLETE" },
    });
    expect(publicOnly.some((r) => r.id === resume.id)).toBe(true);
    expect(publicOnly.some((r) => r.id === resume2.id)).toBe(false);
  });
});
