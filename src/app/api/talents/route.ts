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
    const { user } = await requireAuth(request, [Role.COMPANY, Role.ADMIN, Role.SUPER_ADMIN]);
    const company = await prisma.companyProfile.findUnique({
      where: { userId: user.id },
    });
    if (user.role === Role.COMPANY && !company) {
      return jsonOk([]);
    }

    const sp = new URL(request.url).searchParams;
    const jobCategory = sp.get("jobCategory") || undefined;
    const region = sp.get("region") || undefined;
    const nationality = sp.get("nationality") || undefined;
    const koreanLevel = sp.get("koreanLevel") || undefined;
    const language = sp.get("language") || undefined;
    const salaryMax = sp.get("salaryMax");
    const careerMin = sp.get("careerMin");

    const resumes = await prisma.resume.findMany({
      where: {
        visibility: "PUBLIC",
        status: "COMPLETE",
        ...(jobCategory ? { desiredJob: { contains: jobCategory } } : {}),
        ...(region ? { desiredLocation: { contains: region } } : {}),
        ...(salaryMax
          ? { desiredSalary: { lte: Number(salaryMax) } }
          : {}),
        user: {
          role: Role.JOB_SEEKER,
          status: "ACTIVE",
          jobSeekerProfile: {
            ...(nationality ? { nationality: { contains: nationality } } : {}),
            ...(koreanLevel ? { koreanLevel } : {}),
            ...(language ? { languages: { contains: language } } : {}),
            ...(careerMin
              ? { careerYears: { gte: Number(careerMin) } }
              : {}),
          },
        },
      },
      select: {
        id: true,
        title: true,
        desiredJob: true,
        desiredLocation: true,
        desiredSalary: true,
        employmentType: true,
        availableDate: true,
        profileSummary: true,
        updatedAt: true,
        userId: true,
        user: {
          select: {
            id: true,
            jobSeekerProfile: {
              select: {
                name: true,
                nationality: true,
                careerYears: true,
                koreanLevel: true,
                desiredJobCategory: true,
                desiredWorkRegion: true,
                // Minimal PII in search results — no phone/email/birth
              },
            },
          },
        },
        languages: true,
        skills: { take: 8 },
      },
      orderBy: { updatedAt: "desc" },
      take: 50,
    });

    // Mask full name partially
    const masked = resumes.map((r) => ({
      ...r,
      user: {
        id: r.user.id,
        jobSeekerProfile: r.user.jobSeekerProfile
          ? {
              ...r.user.jobSeekerProfile,
              name: r.user.jobSeekerProfile.name
                ? `${r.user.jobSeekerProfile.name.slice(0, 1)}**`
                : "비공개",
            }
          : null,
      },
    }));

    return jsonOk(masked);
  } catch (e) {
    return handleRouteError(e);
  }
}
