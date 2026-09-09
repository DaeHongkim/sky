import { Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import { jsonOk, handleRouteError } from "@/lib/api";
import { requireUser } from "@/lib/auth/session";

export async function GET() {
  try {
    const user = await requireUser([Role.JOB_SEEKER, Role.COMPANY, Role.ADMIN]);

    if (user.role === Role.JOB_SEEKER) {
      const items = await prisma.application.findMany({
        where: { jobSeekerId: user.id },
        include: {
          jobPost: { select: { id: true, title: true, workLocation: true, status: true } },
          company: { select: { id: true, companyName: true, logoUrl: true } },
          resume: { select: { id: true, title: true } },
          histories: { orderBy: { createdAt: "desc" }, take: 10 },
        },
        orderBy: { appliedAt: "desc" },
      });
      return jsonOk(items);
    }

    if (user.role === Role.COMPANY) {
      const company = await prisma.companyProfile.findUnique({ where: { userId: user.id } });
      if (!company) return jsonOk([]);
      const items = await prisma.application.findMany({
        where: { companyId: company.id },
        include: {
          jobPost: { select: { id: true, title: true } },
          jobSeeker: { select: { id: true, name: true, email: true } },
          resume: {
            select: {
              id: true,
              title: true,
              desiredJob: true,
              desiredLocation: true,
              visibility: true,
              status: true,
            },
          },
          histories: { orderBy: { createdAt: "desc" }, take: 5 },
        },
        orderBy: { appliedAt: "desc" },
      });
      return jsonOk(items);
    }

    const items = await prisma.application.findMany({
      include: {
        jobPost: { select: { id: true, title: true } },
        company: { select: { companyName: true } },
        jobSeeker: { select: { id: true, email: true, name: true } },
      },
      orderBy: { appliedAt: "desc" },
      take: 200,
    });
    return jsonOk(items);
  } catch (error) {
    return handleRouteError(error);
  }
}
