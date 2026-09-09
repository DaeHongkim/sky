import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  handleRouteError,
  jsonOk,
  requireAuth,
} from "@/lib/recruit/api";

export async function GET(request: NextRequest) {
  try {
    const { user } = await requireAuth(request, [Role.COMPANY]);
    const company = await prisma.companyProfile.findUnique({
      where: { userId: user.id },
    });
    if (!company) return jsonOk(null);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const [
      openJobs,
      todayApplicants,
      newApplicants,
      upcomingInterviews,
      hired,
      closingSoon,
      scoutResponses,
      recentApplicants,
    ] = await Promise.all([
      prisma.jobPost.count({
        where: { companyId: company.id, status: "OPEN" },
      }),
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
      prisma.application.count({
        where: { companyId: company.id, status: "HIRED" },
      }),
      prisma.jobPost.count({
        where: {
          companyId: company.id,
          status: "OPEN",
          deadline: { lte: in7Days, gte: new Date() },
        },
      }),
      prisma.scoutOffer.count({
        where: {
          companyId: company.id,
          status: { in: ["ACCEPTED", "DECLINED", "OPENED"] },
        },
      }),
      prisma.application.findMany({
        where: { companyId: company.id },
        take: 10,
        orderBy: { appliedAt: "desc" },
        include: {
          jobSeeker: {
            select: {
              name: true,
              jobSeekerProfile: { select: { name: true, nationality: true } },
            },
          },
          jobPost: { select: { title: true } },
        },
      }),
    ]);

    return jsonOk({
      openJobs,
      todayApplicants,
      newApplicants,
      upcomingInterviews,
      hired,
      closingSoon,
      scoutResponses,
      recentApplicants,
    });
  } catch (e) {
    return handleRouteError(e);
  }
}
