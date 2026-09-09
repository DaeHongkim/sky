import { Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { requireUser } from "@/lib/auth/session";
import { emitHireCompleted } from "@/lib/integrations/hq";
import { createNotification } from "@/lib/notifications";
import { applicationStatusSchema } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  try {
    const user = await requireUser([Role.COMPANY, Role.ADMIN]);
    const { id } = await ctx.params;
    const body = applicationStatusSchema.parse(await request.json());

    const application = await prisma.application.findUnique({ where: { id } });
    if (!application) return jsonError("NOT_FOUND", 404);

    if (user.role === Role.COMPANY) {
      const company = await prisma.companyProfile.findUnique({ where: { userId: user.id } });
      if (!company || company.id !== application.companyId) {
        return jsonError("FORBIDDEN", 403);
      }
    }

    if (body.status === "WITHDRAWN") {
      return jsonError("COMPANY_CANNOT_WITHDRAW", 400);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const app = await tx.application.update({
        where: { id },
        data: {
          status: body.status,
          companyMemo: body.memo ?? undefined,
        },
      });
      await tx.applicationHistory.create({
        data: {
          applicationId: id,
          fromStatus: application.status,
          toStatus: body.status,
          changedById: user.id,
          note: body.note,
        },
      });
      return app;
    });

    await createNotification({
      userId: application.jobSeekerId,
      type: "APPLICATION_STATUS_CHANGED",
      title: "지원 상태가 변경되었습니다",
      body: `${application.status} → ${body.status}`,
      linkUrl: "/recruit/my/applications",
    });

    if (body.status === "HIRED") {
      await emitHireCompleted(updated.id);
      await createNotification({
        userId: application.jobSeekerId,
        type: "HIRED",
        title: "채용이 확정되었습니다",
        body: "근로계약 및 채용 프로세스가 완료되었습니다.",
        linkUrl: "/recruit/my/applications",
      });
    }

    return jsonOk(updated);
  } catch (error) {
    return handleRouteError(error);
  }
}
