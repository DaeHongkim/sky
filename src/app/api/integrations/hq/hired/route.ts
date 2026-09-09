import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import {
  handleRouteError,
  jsonOk,
  parseJson,
  requireAuth,
} from "@/lib/recruit/api";
import {
  deliverHireWebhook,
  enqueueHireCompleted,
} from "@/lib/integrations/hq/hired";

/**
 * Manual / system trigger for HIHONG HQ hire onboarding webhook.
 * Does not implement HQ attendance/payroll/POS.
 */
const schema = z.object({
  applicationId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    await requireAuth(request, [Role.ADMIN, Role.SUPER_ADMIN, Role.COMPANY]);
    const body = await parseJson(request, schema);
    const app = await prisma.application.findUnique({
      where: { id: body.applicationId },
      include: { contracts: { where: { status: "SIGNED" }, take: 1 } },
    });
    if (!app || app.status !== "HIRED") {
      const err = new Error("APPLICATION_NOT_HIRED");
      (err as Error & { status: number }).status = 400;
      throw err;
    }
    const outbox = await enqueueHireCompleted({
      event: "HIRED",
      applicationId: app.id,
      companyId: app.companyId,
      jobSeekerId: app.jobSeekerId,
      jobPostId: app.jobPostId,
      hiredAt: new Date().toISOString(),
      contractId: app.contracts[0]?.id,
    });
    const result = await deliverHireWebhook(outbox.id);
    return jsonOk({ outboxId: outbox.id, delivery: result });
  } catch (e) {
    return handleRouteError(e);
  }
}
