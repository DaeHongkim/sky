import { emitHireCompleted } from "@/lib/integrations/hq";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { requireUser } from "@/lib/auth/session";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/db";

/**
 * POST /api/integrations/hq/hired
 * Manual/retry endpoint for HireCompleted → HQ onboarding webhook.
 */
export async function POST(request: Request) {
  try {
    await requireUser([Role.ADMIN, Role.COMPANY]);
    const { applicationId } = (await request.json()) as { applicationId?: string };
    if (!applicationId) return jsonError("applicationId required", 400);

    const app = await prisma.application.findUnique({ where: { id: applicationId } });
    if (!app || app.status !== "HIRED") return jsonError("NOT_HIRED", 400);

    const event = await emitHireCompleted(applicationId);
    return jsonOk(event);
  } catch (error) {
    return handleRouteError(error);
  }
}
