import { Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { requireUser } from "@/lib/auth/session";
import { createNotification } from "@/lib/notifications";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_request: Request, ctx: Ctx) {
  try {
    const user = await requireUser([Role.JOB_SEEKER]);
    const { id } = await ctx.params;
    const application = await prisma.application.findFirst({
      where: { id, jobSeekerId: user.id },
      include: { jobPost: true, company: true },
    });
    if (!application) return jsonError("NOT_FOUND", 404);
    if (["HIRED", "WITHDRAWN"].includes(application.status)) {
      return jsonError("CANNOT_WITHDRAW", 400);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const app = await tx.application.update({
        where: { id },
        data: { status: "WITHDRAWN", withdrawnAt: new Date() },
      });
      await tx.applicationHistory.create({
        data: {
          applicationId: id,
          fromStatus: application.status,
          toStatus: "WITHDRAWN",
          changedById: user.id,
          note: "지원 취소",
        },
      });
      return app;
    });

    await createNotification({
      userId: user.id,
      type: "APPLICATION_WITHDRAWN",
      title: "지원이 취소되었습니다",
      body: application.jobPost.title,
    });
    await createNotification({
      userId: application.company.userId,
      type: "APPLICATION_WITHDRAWN",
      title: "지원자가 지원을 취소했습니다",
      body: application.jobPost.title,
      linkUrl: "/recruit/company/applicants",
    });

    return jsonOk(updated);
  } catch (error) {
    return handleRouteError(error);
  }
}
