import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { applySchema } from "@/lib/applications/validation";
import { errorResponse, KnownApiError } from "@/lib/api/respond";

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/job-posts/[id]/apply">
) {
  try {
    const user = await requireUser(["JOB_SEEKER"]);
    const { id: jobPostId } = await ctx.params;
    const { resumeId } = applySchema.parse(await request.json());

    const [jobPost, resume] = await Promise.all([
      prisma.jobPost.findUnique({ where: { id: jobPostId } }),
      prisma.resume.findUnique({ where: { id: resumeId } }),
    ]);

    if (!jobPost || jobPost.status !== "OPEN") {
      throw new KnownApiError("JOB_NOT_OPEN", "지원할 수 없는 채용공고입니다.", 400);
    }
    if (!resume || resume.userId !== user.id) {
      throw new KnownApiError("RESUME_NOT_FOUND", "이력서를 찾을 수 없습니다.", 404);
    }

    // 중복지원 방지: 취소(WITHDRAWN)한 지원 건이 아니라면 동일 공고에 다시 지원할 수 없다.
    const existing = await prisma.application.findFirst({
      where: { jobPostId, jobSeekerId: user.id, status: { not: "WITHDRAWN" } },
    });
    if (existing) {
      throw new KnownApiError("ALREADY_APPLIED", "이미 지원한 채용공고입니다.", 409);
    }

    const application = await prisma.$transaction(async (tx) => {
      const app = await tx.application.create({
        data: {
          jobPostId,
          jobSeekerId: user.id,
          resumeId,
          companyId: jobPost.companyId,
          status: "APPLIED",
        },
      });

      await tx.applicationHistory.create({
        data: {
          applicationId: app.id,
          toStatus: "APPLIED",
          changedByUserId: user.id,
        },
      });

      await tx.notification.create({
        data: {
          userId: jobPost.companyId,
          type: "NEW_APPLICANT",
          title: "새로운 지원자가 있습니다.",
          body: `"${jobPost.title}" 공고에 새 지원자가 도착했습니다.`,
          linkUrl: `/recruit/company/applicants?jobPostId=${jobPostId}`,
        },
      });
      await tx.notification.create({
        data: {
          userId: user.id,
          type: "APPLICATION_SUBMITTED",
          title: "지원이 완료되었습니다.",
          body: `"${jobPost.title}"에 지원했습니다.`,
          linkUrl: `/recruit/seeker/applications`,
        },
      });

      return app;
    });

    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
