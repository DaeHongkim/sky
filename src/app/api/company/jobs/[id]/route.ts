import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { jobPostUpdateSchema } from "@/lib/jobpost/validation";
import { errorResponse, KnownApiError } from "@/lib/api/respond";

const allowedTransitions: Record<string, string[]> = {
  DRAFT: ["DRAFT", "OPEN"],
  OPEN: ["OPEN", "CLOSED"],
  CLOSED: ["CLOSED", "OPEN"],
  EXPIRED: ["EXPIRED", "OPEN"],
};

async function loadOwnedJob(userId: string, jobId: string) {
  const job = await prisma.jobPost.findUnique({ where: { id: jobId } });
  if (!job || job.companyId !== userId) {
    throw new KnownApiError("NOT_FOUND", "채용공고를 찾을 수 없습니다.", 404);
  }
  return job;
}

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/company/jobs/[id]">
) {
  try {
    const user = await requireUser(["COMPANY"]);
    const { id } = await ctx.params;
    const job = await loadOwnedJob(user.id, id);
    return NextResponse.json({ job });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/company/jobs/[id]">
) {
  try {
    const user = await requireUser(["COMPANY"]);
    const { id } = await ctx.params;
    const existing = await loadOwnedJob(user.id, id);

    const { status, ...fields } = jobPostUpdateSchema.parse(await request.json());

    if (status && status !== existing.status) {
      const allowed = allowedTransitions[existing.status] ?? [];
      if (!allowed.includes(status)) {
        throw new KnownApiError(
          "INVALID_STATUS_TRANSITION",
          `${existing.status} 상태에서 ${status}(으)로 변경할 수 없습니다.`,
          400
        );
      }
      if (status === "OPEN") {
        const company = await prisma.companyProfile.findUnique({ where: { userId: user.id } });
        if (company?.verificationStatus !== "VERIFIED") {
          throw new KnownApiError(
            "COMPANY_NOT_VERIFIED",
            "기업 인증(VERIFIED) 완료 후 채용공고를 게시할 수 있습니다.",
            403
          );
        }
      }
    }

    const job = await prisma.jobPost.update({
      where: { id },
      data: { ...fields, ...(status ? { status } : {}) },
    });

    return NextResponse.json({ job });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/company/jobs/[id]">
) {
  try {
    const user = await requireUser(["COMPANY"]);
    const { id } = await ctx.params;
    await loadOwnedJob(user.id, id);

    const applicationCount = await prisma.application.count({ where: { jobPostId: id } });
    if (applicationCount > 0) {
      throw new KnownApiError(
        "HAS_APPLICATIONS",
        "지원자가 있는 공고는 삭제할 수 없습니다. 마감 처리를 이용하세요.",
        409
      );
    }

    await prisma.jobPost.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
