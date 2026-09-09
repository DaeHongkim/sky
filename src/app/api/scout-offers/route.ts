import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { scoutOfferCreateSchema } from "@/lib/talent/validation";
import { errorResponse, KnownApiError } from "@/lib/api/respond";

export async function GET() {
  try {
    const user = await requireUser(["COMPANY", "JOB_SEEKER"]);

    const offers = await prisma.scoutOffer.findMany({
      where: user.role === "COMPANY" ? { companyId: user.id } : { jobSeekerId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        company: { select: { companyName: true } },
        jobSeeker: { include: { jobSeekerProfile: { select: { name: true } } } },
        jobPost: { select: { title: true } },
      },
    });

    return NextResponse.json({ offers });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(["COMPANY"]);
    const input = scoutOfferCreateSchema.parse(await request.json());

    const [seekerProfile, publicResumeCount] = await Promise.all([
      prisma.jobSeekerProfile.findUnique({ where: { userId: input.jobSeekerId } }),
      prisma.resume.count({
        where: { userId: input.jobSeekerId, visibility: "PUBLIC", status: "COMPLETED" },
      }),
    ]);

    if (!seekerProfile || publicResumeCount === 0) {
      throw new KnownApiError("TALENT_NOT_FOUND", "스카우트할 수 없는 인재입니다.", 404);
    }

    if (input.jobPostId) {
      const jobPost = await prisma.jobPost.findUnique({ where: { id: input.jobPostId } });
      if (!jobPost || jobPost.companyId !== user.id) {
        throw new KnownApiError("JOB_NOT_FOUND", "채용공고를 찾을 수 없습니다.", 404);
      }
    }

    const offer = await prisma.$transaction(async (tx) => {
      const created = await tx.scoutOffer.create({
        data: {
          companyId: user.id,
          senderUserId: user.id,
          jobSeekerId: input.jobSeekerId,
          jobPostId: input.jobPostId,
          title: input.title,
          message: input.message,
          expiresAt: input.expiresAt,
          status: "PENDING",
        },
      });

      await tx.notification.create({
        data: {
          userId: input.jobSeekerId,
          type: "SCOUT_RECEIVED",
          title: "새로운 스카우트 제안이 도착했습니다.",
          body: input.title,
          linkUrl: "/recruit/seeker/scouts",
        },
      });

      return created;
    });

    return NextResponse.json({ offer }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
