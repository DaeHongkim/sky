import { Prisma, Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { requireUser } from "@/lib/auth/session";

export async function GET(request: Request) {
  try {
    const user = await requireUser([Role.COMPANY, Role.ADMIN]);
    const { searchParams } = new URL(request.url);
    const jobCategory = searchParams.get("jobCategory")?.trim();
    const location = searchParams.get("location")?.trim();
    const nationality = searchParams.get("nationality")?.trim();
    const koreanLevel = searchParams.get("koreanLevel")?.trim();
    const careerYearsMin = searchParams.get("careerYearsMin");

    const where: Prisma.ResumeWhereInput = {
      visibility: "PUBLIC",
      status: "COMPLETE",
      AND: [
        jobCategory ? { desiredJob: { contains: jobCategory, mode: "insensitive" } } : {},
        location ? { desiredLocation: { contains: location, mode: "insensitive" } } : {},
        careerYearsMin
          ? { user: { jobSeekerProfile: { careerYears: { gte: Number(careerYearsMin) } } } }
          : {},
        nationality
          ? { user: { jobSeekerProfile: { nationality: { contains: nationality, mode: "insensitive" } } } }
          : {},
        koreanLevel
          ? { user: { jobSeekerProfile: { koreanLevel: { contains: koreanLevel, mode: "insensitive" } } } }
          : {},
      ],
    };

    const resumes = await prisma.resume.findMany({
      where,
      take: 50,
      orderBy: { updatedAt: "desc" },
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
        user: {
          select: {
            id: true,
            jobSeekerProfile: {
              select: {
                nationality: true,
                careerYears: true,
                koreanLevel: true,
                languages: true,
                desiredWorkRegions: true,
                // PII minimized — no phone/email/birthDate/photo in list
              },
            },
          },
        },
        languages: { select: { language: true, level: true } },
        skills: { select: { name: true } },
      },
    });

    return jsonOk(
      resumes.map((r) => ({
        resumeId: r.id,
        jobSeekerId: r.user.id,
        title: r.title,
        desiredJob: r.desiredJob,
        desiredLocation: r.desiredLocation,
        desiredSalary: r.desiredSalary,
        employmentType: r.employmentType,
        availableDate: r.availableDate,
        summary: r.profileSummary?.slice(0, 160) ?? null,
        nationality: r.user.jobSeekerProfile?.nationality ?? null,
        careerYears: r.user.jobSeekerProfile?.careerYears ?? 0,
        koreanLevel: r.user.jobSeekerProfile?.koreanLevel ?? null,
        languages: r.languages,
        skills: r.skills.map((s) => s.name),
        updatedAt: r.updatedAt,
      })),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  // talent detail view with log
  try {
    const user = await requireUser([Role.COMPANY]);
    const { jobSeekerId, resumeId } = (await request.json()) as {
      jobSeekerId?: string;
      resumeId?: string;
    };
    if (!jobSeekerId || !resumeId) return jsonError("jobSeekerId and resumeId required", 400);

    const company = await prisma.companyProfile.findUnique({ where: { userId: user.id } });
    if (!company) return jsonError("FORBIDDEN", 403);

    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId: jobSeekerId,
        visibility: "PUBLIC",
        status: "COMPLETE",
      },
      include: {
        careers: true,
        educations: true,
        certificates: true,
        languages: true,
        skills: true,
        user: {
          select: {
            id: true,
            name: true,
            jobSeekerProfile: {
              select: {
                name: true,
                nationality: true,
                careerYears: true,
                koreanLevel: true,
                languages: true,
                introduction: true,
                desiredWorkRegions: true,
                availableDate: true,
                // still hide phone/email in response below
              },
            },
          },
        },
      },
    });
    if (!resume) return jsonError("NOT_FOUND", 404);

    await prisma.talentViewLog.create({
      data: {
        companyId: company.id,
        jobSeekerId,
        viewerUserId: user.id,
      },
    });

    return jsonOk({
      resume: {
        id: resume.id,
        title: resume.title,
        profileSummary: resume.profileSummary,
        desiredJob: resume.desiredJob,
        desiredLocation: resume.desiredLocation,
        desiredSalary: resume.desiredSalary,
        employmentType: resume.employmentType,
        availableDate: resume.availableDate,
        careers: resume.careers,
        educations: resume.educations,
        certificates: resume.certificates,
        languages: resume.languages,
        skills: resume.skills,
      },
      profile: resume.user.jobSeekerProfile,
      displayName: resume.user.name || resume.user.jobSeekerProfile?.name || "인재",
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
