import { Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { requireUser } from "@/lib/auth/session";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_request: Request, ctx: Ctx) {
  try {
    const user = await requireUser([Role.JOB_SEEKER]);
    const { id } = await ctx.params;
    const source = await prisma.resume.findFirst({
      where: { id, userId: user.id },
      include: {
        careers: true,
        educations: true,
        certificates: true,
        languages: true,
        skills: true,
        portfolios: true,
        desiredConditions: true,
      },
    });
    if (!source) return jsonError("NOT_FOUND", 404);

    const clone = await prisma.resume.create({
      data: {
        userId: user.id,
        title: `${source.title} (복제)`,
        profileSummary: source.profileSummary,
        desiredJob: source.desiredJob,
        desiredLocation: source.desiredLocation,
        desiredSalary: source.desiredSalary,
        employmentType: source.employmentType,
        availableDate: source.availableDate,
        visibility: "PRIVATE",
        status: "DRAFT",
        isPrimary: false,
        careers: {
          create: source.careers.map(({ id: _id, resumeId: _r, ...c }) => c),
        },
        educations: {
          create: source.educations.map(({ id: _id, resumeId: _r, ...e }) => e),
        },
        certificates: {
          create: source.certificates.map(({ id: _id, resumeId: _r, ...c }) => c),
        },
        languages: {
          create: source.languages.map(({ id: _id, resumeId: _r, ...l }) => l),
        },
        skills: {
          create: source.skills.map(({ id: _id, resumeId: _r, ...s }) => s),
        },
        portfolios: {
          create: source.portfolios.map(({ id: _id, resumeId: _r, ...p }) => p),
        },
        desiredConditions: source.desiredConditions
          ? {
              create: {
                jobCategories: source.desiredConditions.jobCategories,
                locations: source.desiredConditions.locations,
                salaryMin: source.desiredConditions.salaryMin,
                salaryMax: source.desiredConditions.salaryMax,
                employmentTypes: source.desiredConditions.employmentTypes,
                otherNotes: source.desiredConditions.otherNotes,
              },
            }
          : undefined,
      },
    });

    return jsonOk(clone, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
