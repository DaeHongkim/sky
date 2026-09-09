import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { requireUser } from "@/lib/auth/session";
import { createNotification } from "@/lib/notifications";

const createSchema = z.object({
  applicationId: z.string(),
  interviewType: z.enum(["ONLINE", "OFFLINE", "PHONE", "AI_PRESCREEN"]).optional(),
  scheduledAt: z.string().optional().nullable(),
  durationMin: z.number().int().positive().optional(),
  meetingUrl: z.string().url().optional().nullable(),
  location: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const user = await requireUser([Role.JOB_SEEKER, Role.COMPANY, Role.ADMIN]);
    if (user.role === Role.JOB_SEEKER) {
      return jsonOk(
        await prisma.interview.findMany({
          where: { jobSeekerId: user.id },
          include: {
            company: { select: { companyName: true } },
            jobPost: { select: { title: true } },
          },
          orderBy: { scheduledAt: "asc" },
        }),
      );
    }
    if (user.role === Role.COMPANY) {
      const company = await prisma.companyProfile.findUnique({ where: { userId: user.id } });
      if (!company) return jsonOk([]);
      return jsonOk(
        await prisma.interview.findMany({
          where: { companyId: company.id },
          include: {
            jobSeeker: { select: { name: true, email: true } },
            jobPost: { select: { title: true } },
          },
          orderBy: { scheduledAt: "asc" },
        }),
      );
    }
    return jsonOk(await prisma.interview.findMany({ take: 200, orderBy: { createdAt: "desc" } }));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser([Role.COMPANY]);
    const company = await prisma.companyProfile.findUnique({ where: { userId: user.id } });
    if (!company) return jsonError("FORBIDDEN", 403);
    const body = createSchema.parse(await request.json());

    const application = await prisma.application.findFirst({
      where: { id: body.applicationId, companyId: company.id },
    });
    if (!application) return jsonError("NOT_FOUND", 404);

    const interview = await prisma.interview.create({
      data: {
        applicationId: application.id,
        companyId: company.id,
        jobSeekerId: application.jobSeekerId,
        jobPostId: application.jobPostId,
        interviewType: body.interviewType ?? "ONLINE",
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
        durationMin: body.durationMin ?? 60,
        meetingUrl: body.meetingUrl,
        location: body.location,
        notes: body.notes,
        status: "REQUESTED",
      },
    });

    await prisma.application.update({
      where: { id: application.id },
      data: {
        status: body.scheduledAt ? "INTERVIEW_SCHEDULED" : "INTERVIEW_REQUESTED",
      },
    });
    await prisma.applicationHistory.create({
      data: {
        applicationId: application.id,
        fromStatus: application.status,
        toStatus: body.scheduledAt ? "INTERVIEW_SCHEDULED" : "INTERVIEW_REQUESTED",
        changedById: user.id,
        note: "면접 요청",
      },
    });

    await createNotification({
      userId: application.jobSeekerId,
      type: "INTERVIEW_REQUESTED",
      title: "면접 요청이 도착했습니다",
      body: body.scheduledAt ? new Date(body.scheduledAt).toLocaleString("ko-KR") : "일정 조율 필요",
      linkUrl: "/recruit/my/interviews",
    });

    if (body.interviewType === "AI_PRESCREEN") {
      await prisma.aiPrescreen.create({
        data: {
          interviewId: interview.id,
          questions: [
            "지원 동기와 이 직무에 대한 이해를 말씀해 주세요.",
            "관련 경험 중 가장 성과가 있었던 사례를 설명해 주세요.",
            "협업 중 갈등이 생겼을 때 어떻게 해결했는지 알려 주세요.",
          ],
        },
      });
    }

    return jsonOk(interview, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
