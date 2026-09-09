import { NextRequest } from "next/server";
import { ApplicationStatus, Role } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  handleRouteError,
  jsonOk,
  requireAuth,
} from "@/lib/recruit/api";
import { isAdminRole } from "@/lib/permissions/roles";

export async function GET(request: NextRequest) {
  try {
    const { user } = await requireAuth(request);
    const { searchParams } = new URL(request.url);

    if (user.role === Role.JOB_SEEKER) {
      const apps = await prisma.application.findMany({
        where: { jobSeekerId: user.id },
        include: {
          jobPost: {
            include: {
              company: { select: { companyName: true, logoUrl: true } },
            },
          },
          resume: { select: { id: true, title: true } },
          histories: { orderBy: { createdAt: "asc" } },
        },
        orderBy: { appliedAt: "desc" },
      });
      return jsonOk(apps);
    }

    if (user.role === Role.COMPANY) {
      const company = await prisma.companyProfile.findUnique({
        where: { userId: user.id },
      });
      if (!company) return jsonOk([]);
      const status = searchParams.get("status") || undefined;
      const jobPostId = searchParams.get("jobPostId") || undefined;
      const apps = await prisma.application.findMany({
        where: {
          companyId: company.id,
          ...(status ? { status: status as ApplicationStatus } : {}),
          ...(jobPostId ? { jobPostId } : {}),
        },
        include: {
          jobPost: { select: { id: true, title: true } },
          jobSeeker: {
            select: {
              id: true,
              name: true,
              email: true,
              jobSeekerProfile: {
                select: {
                  name: true,
                  nationality: true,
                  careerYears: true,
                  desiredJobCategory: true,
                  koreanLevel: true,
                },
              },
            },
          },
          resume: { select: { id: true, title: true, visibility: true } },
          histories: { orderBy: { createdAt: "desc" }, take: 10 },
        },
        orderBy: { appliedAt: "desc" },
      });
      return jsonOk(apps);
    }

    if (isAdminRole(user.role)) {
      const apps = await prisma.application.findMany({
        take: 200,
        orderBy: { appliedAt: "desc" },
        include: {
          jobPost: { select: { title: true } },
          company: { select: { companyName: true } },
          jobSeeker: { select: { email: true, name: true } },
        },
      });
      return jsonOk(apps);
    }

    const err = new Error("FORBIDDEN");
    (err as Error & { status: number }).status = 403;
    throw err;
  } catch (e) {
    return handleRouteError(e);
  }
}
