import { Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { requireUser } from "@/lib/auth/session";

export async function GET() {
  try {
    const user = await requireUser([Role.COMPANY]);
    const company = await prisma.companyProfile.findUnique({ where: { userId: user.id } });
    if (!company) return jsonError("FORBIDDEN", 403);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [
      openJobs,
      todayApplicants,
      newApplicants,
      interviewsSoon,
      hiredCount,
      closingSoon,
      scoutResponses,
      recentApplicants,
    ] = await Promise.all([
      prisma.jobPost.count({ where: { companyId: company.id, status: "OPEN" } }),
      prisma.application.count({
        where: { companyId: company.id, appliedAt: { gte: startOfDay } },
      }),
      prisma.application.count({
        where: { companyId: company.id, status: "APPLIED" },
      }),
      prisma.interview.count({
        where: {
          companyId: company.id,
          status: { in: ["REQUESTED", "CONFIRMED"] },
          scheduledAt: { gte: new Date() },
        },
      }),
      prisma.application.count({ where: { companyId: company.id, status: "HIRED" } }),
      prisma.jobPost.count({
        where: {
          companyId: company.id,
          status: "OPEN",
          deadline: {
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            gte: new Date(),
          },
        },
      }),
      prisma.scoutOffer.count({
        where: {
          companyId: company.id,
          status: { in: ["ACCEPTED", "DECLINED"] },
          updatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.application.findMany({
        where: { companyId: company.id },
        take: 10,
        orderBy: { appliedAt: "desc" },
        include: {
          jobSeeker: { select: { name: true, email: true } },
          jobPost: { select: { title: true } },
          resume: { select: { title: true } },
        },
      }),
    ]);

    return jsonOk({
      openJobs,
      todayApplicants,
      newApplicants,
      interviewsSoon,
      hiredCount,
      closingSoon,
      scoutResponses,
      recentApplicants,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
