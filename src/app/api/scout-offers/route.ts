import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { requireUser } from "@/lib/auth/session";
import { createNotification } from "@/lib/notifications";

const scoutSchema = z.object({
  jobSeekerId: z.string().min(1),
  jobPostId: z.string().optional().nullable(),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
  expiresAt: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const user = await requireUser([Role.JOB_SEEKER, Role.COMPANY, Role.ADMIN]);

    if (user.role === Role.JOB_SEEKER) {
      const items = await prisma.scoutOffer.findMany({
        where: { jobSeekerId: user.id },
        include: {
          company: { select: { companyName: true, logoUrl: true } },
          jobPost: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return jsonOk(items);
    }

    if (user.role === Role.COMPANY) {
      const company = await prisma.companyProfile.findUnique({ where: { userId: user.id } });
      if (!company) return jsonOk([]);
      const items = await prisma.scoutOffer.findMany({
        where: { companyId: company.id },
        include: {
          jobSeeker: { select: { id: true, name: true } },
          jobPost: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return jsonOk(items);
    }

    const items = await prisma.scoutOffer.findMany({
      take: 200,
      orderBy: { createdAt: "desc" },
      include: {
        company: { select: { companyName: true } },
        jobSeeker: { select: { email: true, name: true } },
      },
    });
    return jsonOk(items);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser([Role.COMPANY]);
    const company = await prisma.companyProfile.findUnique({ where: { userId: user.id } });
    if (!company) return jsonError("FORBIDDEN", 403);
    if (company.verificationStatus === "REJECTED") {
      return jsonError("COMPANY_NOT_VERIFIED", 403);
    }

    const body = scoutSchema.parse(await request.json());
    const seeker = await prisma.user.findFirst({
      where: { id: body.jobSeekerId, role: Role.JOB_SEEKER, status: "ACTIVE" },
    });
    if (!seeker) return jsonError("TALENT_NOT_FOUND", 404);

    const offer = await prisma.scoutOffer.create({
      data: {
        companyId: company.id,
        jobSeekerId: body.jobSeekerId,
        jobPostId: body.jobPostId || null,
        title: body.title,
        message: body.message,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      },
    });

    await createNotification({
      userId: body.jobSeekerId,
      type: "SCOUT",
      title: "스카우트 제안이 도착했습니다",
      body: `${company.companyName}: ${body.title}`,
      linkUrl: "/recruit/my/scouts",
    });

    return jsonOk(offer, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
