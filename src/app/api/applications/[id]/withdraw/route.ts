import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { errorResponse, KnownApiError } from "@/lib/api/respond";

export async function POST(
  _request: Request,
  ctx: RouteContext<"/api/applications/[id]/withdraw">
) {
  try {
    const user = await requireUser(["JOB_SEEKER"]);
    const { id } = await ctx.params;

    const application = await prisma.application.findUnique({
      where: { id },
      include: { jobPost: { select: { title: true } } },
    });
    if (!application || application.jobSeekerId !== user.id) {
      throw new KnownApiError("NOT_FOUND", "지원 내역을 찾을 수 없습니다.", 404);
    }
    if (application.status === "WITHDRAWN") {
      throw new KnownApiError("ALREADY_WITHDRAWN", "이미 취소된 지원입니다.", 409);
    }
    if (application.status === "HIRED") {
      throw new KnownApiError("CANNOT_WITHDRAW", "채용확정된 지원은 취소할 수 없습니다.", 409);
    }

    await prisma.$transaction([
      prisma.application.update({
        where: { id },
        data: { status: "WITHDRAWN", withdrawnAt: new Date() },
      }),
      prisma.applicationHistory.create({
        data: {
          applicationId: id,
          fromStatus: application.status,
          toStatus: "WITHDRAWN",
          changedByUserId: user.id,
        },
      }),
      prisma.notification.create({
        data: {
          userId: application.companyId,
          type: "APPLICATION_WITHDRAWN",
          title: "지원이 취소되었습니다.",
          body: `"${application.jobPost.title}" 공고 지원자가 지원을 취소했습니다.`,
        },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
