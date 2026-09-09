import { Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { requireUser } from "@/lib/auth/session";

export async function GET() {
  try {
    const user = await requireUser([Role.JOB_SEEKER]);
    const items = await prisma.jobScrap.findMany({
      where: { userId: user.id },
      include: {
        jobPost: {
          include: {
            company: { select: { companyName: true, logoUrl: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return jsonOk(items);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser([Role.JOB_SEEKER]);
    const { jobPostId } = (await request.json()) as { jobPostId?: string };
    if (!jobPostId) return jsonError("jobPostId required", 400);

    const job = await prisma.jobPost.findUnique({ where: { id: jobPostId } });
    if (!job) return jsonError("NOT_FOUND", 404);

    const scrap = await prisma.jobScrap.upsert({
      where: { userId_jobPostId: { userId: user.id, jobPostId } },
      create: { userId: user.id, jobPostId },
      update: {},
    });
    return jsonOk(scrap, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireUser([Role.JOB_SEEKER]);
    const { searchParams } = new URL(request.url);
    const jobPostId = searchParams.get("jobPostId");
    if (!jobPostId) return jsonError("jobPostId required", 400);
    await prisma.jobScrap.deleteMany({ where: { userId: user.id, jobPostId } });
    return jsonOk({ deleted: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
