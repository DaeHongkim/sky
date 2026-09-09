import { createHash } from "crypto";
import { prisma } from "@/lib/db/prisma";

/**
 * HireCompleted event for future HIHONG HQ onboarding.
 * Does NOT implement attendance/payroll/POS — only emits an integration event.
 */
export type HireCompletedPayload = {
  event: "HIRED";
  applicationId: string;
  companyId: string;
  jobSeekerId: string;
  jobPostId: string;
  hiredAt: string;
  contractId?: string | null;
  offerId?: string | null;
};

export async function enqueueHireCompleted(payload: HireCompletedPayload) {
  return prisma.integrationOutbox.create({
    data: {
      eventType: "HireCompleted",
      payloadJson: JSON.stringify(payload),
      status: "PENDING",
    },
  });
}

export async function deliverHireWebhook(outboxId: string) {
  const row = await prisma.integrationOutbox.findUnique({ where: { id: outboxId } });
  if (!row) return { ok: false, reason: "NOT_FOUND" as const };

  const url = process.env.HQ_HIRED_WEBHOOK_URL;
  if (!url) {
    await prisma.integrationOutbox.update({
      where: { id: outboxId },
      data: { status: "SKIPPED", lastError: "HQ_HIRED_WEBHOOK_URL not configured" },
    });
    return { ok: true, skipped: true as const };
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.HQ_API_KEY
          ? { Authorization: `Bearer ${process.env.HQ_API_KEY}` }
          : {}),
      },
      body: row.payloadJson,
    });
    if (!res.ok) {
      throw new Error(`HTTP_${res.status}`);
    }
    await prisma.integrationOutbox.update({
      where: { id: outboxId },
      data: { status: "SENT", sentAt: new Date(), attempts: { increment: 1 } },
    });
    return { ok: true as const };
  } catch (e) {
    await prisma.integrationOutbox.update({
      where: { id: outboxId },
      data: {
        attempts: { increment: 1 },
        lastError: e instanceof Error ? e.message : "deliver_failed",
        status: "FAILED",
      },
    });
    return { ok: false as const };
  }
}

export function integrityHash(content: string, meta: Record<string, unknown>) {
  return createHash("sha256")
    .update(content)
    .update(JSON.stringify(meta))
    .digest("hex");
}
