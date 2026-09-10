import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { errorResponse, KnownApiError } from "@/lib/api/respond";

export async function POST(
  _request: Request,
  ctx: RouteContext<"/api/job-posts/[id]/scrap">
) {
  try {
    const user = await requireUser(["JOB_SEEKER"]);
    const { id: jobPostId } = await ctx.params;

    const jobPost = await prisma.jobPost.findUnique({ where: { id: jobPostId } });
    if (!jobPost) throw new KnownApiError("NOT_FOUND", "채용공고를 찾을 수 없습니다.", 404);

    const existing = await prisma.jobScrap.findUnique({
      where: { jobSeekerId_jobPostId: { jobSeekerId: user.id, jobPostId } },
    });

    if (existing) {
      await prisma.jobScrap.delete({ where: { id: existing.id } });
      return NextResponse.json({ scrapped: false });
    }

    await prisma.jobScrap.create({ data: { jobSeekerId: user.id, jobPostId } });
    return NextResponse.json({ scrapped: true });
  } catch (error) {
    return errorResponse(error);
  }
}
