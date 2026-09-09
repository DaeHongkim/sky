import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { requireUser } from "@/lib/auth/session";
import { createNotification } from "@/lib/notifications";

const createSchema = z.object({
  applicationId: z.string(),
  salary: z.number().int().nonnegative().optional(),
  employmentType: z.string().optional(),
  workLocation: z.string().optional(),
  startDate: z.string().optional().nullable(),
  workingHours: z.string().optional(),
  benefits: z.string().optional(),
  message: z.string().optional(),
  expiresAt: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const user = await requireUser([Role.JOB_SEEKER, Role.COMPANY, Role.ADMIN]);
    if (user.role === Role.JOB_SEEKER) {
      return jsonOk(
        await prisma.jobOffer.findMany({
          where: { jobSeekerId: user.id },
          include: { company: { select: { companyName: true } }, jobPost: { select: { title: true } } },
          orderBy: { createdAt: "desc" },
        }),
      );
    }
    if (user.role === Role.COMPANY) {
      const company = await prisma.companyProfile.findUnique({ where: { userId: user.id } });
      if (!company) return jsonOk([]);
      return jsonOk(
        await prisma.jobOffer.findMany({
          where: { companyId: company.id },
          include: { jobSeeker: { select: { name: true, email: true } } },
          orderBy: { createdAt: "desc" },
        }),
      );
    }
    return jsonOk(await prisma.jobOffer.findMany({ take: 200, orderBy: { createdAt: "desc" } }));
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

    const offer = await prisma.jobOffer.create({
      data: {
        applicationId: application.id,
        companyId: company.id,
        jobSeekerId: application.jobSeekerId,
        jobPostId: application.jobPostId,
        salary: body.salary,
        employmentType: body.employmentType,
        workLocation: body.workLocation,
        startDate: body.startDate ? new Date(body.startDate) : null,
        workingHours: body.workingHours,
        benefits: body.benefits,
        message: body.message,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      },
    });

    await prisma.application.update({
      where: { id: application.id },
      data: { status: "OFFER" },
    });
    await prisma.applicationHistory.create({
      data: {
        applicationId: application.id,
        fromStatus: application.status,
        toStatus: "OFFER",
        changedById: user.id,
        note: "Offer 발송",
      },
    });

    await createNotification({
      userId: application.jobSeekerId,
      type: "OFFER",
      title: "채용 Offer가 도착했습니다",
      body: company.companyName,
      linkUrl: "/recruit/my/offers",
    });

    return jsonOk(offer, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
