import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/current-user";
import { startConversationSchema } from "@/lib/messaging/validation";
import { errorResponse, KnownApiError } from "@/lib/api/respond";

export async function GET() {
  try {
    const user = await requireUser(["JOB_SEEKER", "COMPANY"]);
    const conversations = await prisma.conversation.findMany({
      where: user.role === "COMPANY" ? { companyId: user.id } : { jobSeekerId: user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        jobPost: { select: { title: true } },
        jobSeeker: { select: { jobSeekerProfile: { select: { name: true } } } },
        company: { select: { companyProfile: { select: { companyName: true } } } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    const withUnreadCount = await Promise.all(
      conversations.map(async (c) => {
        const unreadCount = await prisma.message.count({
          where: { conversationId: c.id, isRead: false, senderId: { not: user.id } },
        });
        return { ...c, unreadCount };
      })
    );

    return NextResponse.json({ conversations: withUnreadCount });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(["JOB_SEEKER", "COMPANY"]);
    const input = startConversationSchema.parse(await request.json());

    let jobSeekerId: string;
    let companyId: string;
    let jobPostId: string | null = null;
    let applicationId: string | null = null;

    if (input.applicationId) {
      const application = await prisma.application.findUnique({
        where: { id: input.applicationId },
      });
      if (!application) throw new KnownApiError("NOT_FOUND", "지원 내역을 찾을 수 없습니다.", 404);

      const isParty =
        (user.role === "JOB_SEEKER" && application.jobSeekerId === user.id) ||
        (user.role === "COMPANY" && application.companyId === user.id);
      if (!isParty) throw new KnownApiError("FORBIDDEN", "접근 권한이 없습니다.", 403);

      jobSeekerId = application.jobSeekerId;
      companyId = application.companyId;
      jobPostId = application.jobPostId;
      applicationId = application.id;

      const existing = await prisma.conversation.findUnique({ where: { applicationId } });
      if (existing) return NextResponse.json({ conversation: existing });
    } else if (input.jobPostId) {
      const jobPost = await prisma.jobPost.findUnique({ where: { id: input.jobPostId } });
      if (!jobPost) throw new KnownApiError("NOT_FOUND", "채용공고를 찾을 수 없습니다.", 404);

      if (user.role === "JOB_SEEKER") {
        jobSeekerId = user.id;
        companyId = jobPost.companyId;
      } else {
        if (!input.jobSeekerId) {
          throw new KnownApiError("MISSING_JOB_SEEKER_ID", "구직자를 지정해야 합니다.", 400);
        }
        if (jobPost.companyId !== user.id) {
          throw new KnownApiError("FORBIDDEN", "접근 권한이 없습니다.", 403);
        }
        jobSeekerId = input.jobSeekerId;
        companyId = user.id;
      }
      jobPostId = jobPost.id;

      const existing = await prisma.conversation.findFirst({
        where: { jobPostId, jobSeekerId, companyId, applicationId: null },
      });
      if (existing) return NextResponse.json({ conversation: existing });
    } else {
      throw new KnownApiError(
        "MISSING_CONTEXT",
        "applicationId 또는 jobPostId가 필요합니다.",
        400
      );
    }

    const conversation = await prisma.conversation.create({
      data: { jobSeekerId, companyId, jobPostId, applicationId },
    });

    return NextResponse.json({ conversation }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
