import { Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { requireUser } from "@/lib/auth/session";
import { createNotification } from "@/lib/notifications";
import { applySchema } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, ctx: Ctx) {
  try {
    const user = await requireUser([Role.JOB_SEEKER]);
    const { id: jobPostId } = await ctx.params;
    const body = applySchema.parse(await request.json());

    const job = await prisma.jobPost.findUnique({ where: { id: jobPostId } });
    if (!job || job.status !== "OPEN") return jsonError("JOB_NOT_OPEN", 400);

    const resume = await prisma.resume.findFirst({
      where: { id: body.resumeId, userId: user.id },
    });
    if (!resume) return jsonError("RESUME_NOT_FOUND", 404);

    const existing = await prisma.application.findUnique({
      where: { jobPostId_jobSeekerId: { jobPostId, jobSeekerId: user.id } },
    });
    if (existing && existing.status !== "WITHDRAWN") {
      return jsonError("ALREADY_APPLIED", 409);
    }

    const application = await prisma.$transaction(async (tx) => {
      const app = existing
        ? await tx.application.update({
            where: { id: existing.id },
            data: {
              resumeId: resume.id,
              status: "APPLIED",
              appliedAt: new Date(),
              withdrawnAt: null,
            },
          })
        : await tx.application.create({
            data: {
              jobPostId,
              jobSeekerId: user.id,
              resumeId: resume.id,
              companyId: job.companyId,
              status: "APPLIED",
            },
          });

      await tx.applicationHistory.create({
        data: {
          applicationId: app.id,
          fromStatus: existing?.status ?? null,
          toStatus: "APPLIED",
          changedById: user.id,
          note: "지원 완료",
        },
      });

      return app;
    });

    const company = await prisma.companyProfile.findUnique({
      where: { id: job.companyId },
      select: { userId: true, companyName: true },
    });

    await createNotification({
      userId: user.id,
      type: "APPLICATION_SUBMITTED",
      title: "지원이 완료되었습니다",
      body: job.title,
      linkUrl: `/recruit/my/applications`,
    });

    if (company) {
      await createNotification({
        userId: company.userId,
        type: "NEW_APPLICANT",
        title: "신규 지원자가 등록되었습니다",
        body: `${job.title} — ${user.name || user.email}`,
        linkUrl: `/recruit/company/applicants`,
      });
    }

    return jsonOk(application, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
