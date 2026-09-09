import { createHash } from "crypto";
import { prisma } from "@/lib/db";

/**
 * HireCompleted event for future HIHONG HQ onboarding.
 * Does NOT implement HQ attendance/payroll/POS — only queues a webhook payload.
 */
export async function emitHireCompleted(applicationId: string) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      jobSeeker: { select: { id: true, email: true, name: true } },
      company: { select: { id: true, companyName: true, businessNumber: true } },
      jobPost: { select: { id: true, title: true, employmentType: true, workLocation: true } },
      contracts: {
        where: { status: "SIGNED" },
        orderBy: { version: "desc" },
        take: 1,
      },
    },
  });

  if (!application || application.status !== "HIRED") {
    throw new Error("Application is not HIRED");
  }

  const payload = {
    event: "HIRED",
    occurredAt: new Date().toISOString(),
    applicationId: application.id,
    company: application.company,
    jobSeeker: {
      id: application.jobSeeker.id,
      email: application.jobSeeker.email,
      name: application.jobSeeker.name,
    },
    jobPost: application.jobPost,
    contractVersion: application.contracts[0]?.version ?? null,
  };

  const event = await prisma.hireIntegrationEvent.create({
    data: {
      applicationId: application.id,
      companyId: application.companyId,
      jobSeekerId: application.jobSeekerId,
      payload: payload as object,
      status: "PENDING",
    },
  });

  const webhookUrl = process.env.HQ_WEBHOOK_URL;
  if (!webhookUrl) {
    return event;
  }

  try {
    const body = JSON.stringify(payload);
    const secret = process.env.HQ_WEBHOOK_SECRET || "";
    const signature = createHash("sha256").update(`${secret}.${body}`).digest("hex");
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-HIHONG-Event": "HIRED",
        "X-HIHONG-Signature": signature,
      },
      body,
    });
    if (!res.ok) {
      throw new Error(`HQ webhook status ${res.status}`);
    }
    return prisma.hireIntegrationEvent.update({
      where: { id: event.id },
      data: { status: "DELIVERED", deliveredAt: new Date(), attempts: { increment: 1 } },
    });
  } catch (err) {
    return prisma.hireIntegrationEvent.update({
      where: { id: event.id },
      data: {
        status: "FAILED",
        attempts: { increment: 1 },
        lastError: err instanceof Error ? err.message : "webhook_failed",
      },
    });
  }
}
