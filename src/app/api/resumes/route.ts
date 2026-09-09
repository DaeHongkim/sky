import { Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import { jsonOk, handleRouteError } from "@/lib/api";
import { requireUser } from "@/lib/auth/session";
import { resumeUpsertSchema } from "@/lib/validation";

function parseDate(value?: string | null) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function GET() {
  try {
    const user = await requireUser([Role.JOB_SEEKER, Role.ADMIN]);
    const resumes = await prisma.resume.findMany({
      where: { userId: user.id },
      include: {
        careers: { orderBy: { sortOrder: "asc" } },
        educations: { orderBy: { sortOrder: "asc" } },
        certificates: { orderBy: { sortOrder: "asc" } },
        languages: { orderBy: { sortOrder: "asc" } },
        skills: { orderBy: { sortOrder: "asc" } },
        portfolios: { orderBy: { sortOrder: "asc" } },
        desiredConditions: true,
      },
      orderBy: [{ isPrimary: "desc" }, { updatedAt: "desc" }],
    });
    return jsonOk(resumes);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser([Role.JOB_SEEKER]);
    const body = resumeUpsertSchema.parse(await request.json());

    const resume = await prisma.$transaction(async (tx) => {
      if (body.isPrimary) {
        await tx.resume.updateMany({
          where: { userId: user.id },
          data: { isPrimary: false },
        });
      }

      const count = await tx.resume.count({ where: { userId: user.id } });
      return tx.resume.create({
        data: {
          userId: user.id,
          title: body.title,
          profileSummary: body.profileSummary,
          desiredJob: body.desiredJob,
          desiredLocation: body.desiredLocation,
          desiredSalary: body.desiredSalary,
          employmentType: body.employmentType,
          availableDate: parseDate(body.availableDate),
          visibility: body.visibility ?? "PRIVATE",
          status: body.status ?? "DRAFT",
          isPrimary: body.isPrimary ?? count === 0,
          careers: body.careers
            ? {
                create: body.careers.map((c, i) => ({
                  ...c,
                  startDate: parseDate(c.startDate),
                  endDate: parseDate(c.endDate),
                  sortOrder: i,
                })),
              }
            : undefined,
          educations: body.educations
            ? {
                create: body.educations.map((e, i) => ({
                  ...e,
                  startDate: parseDate(e.startDate),
                  endDate: parseDate(e.endDate),
                  sortOrder: i,
                })),
              }
            : undefined,
          certificates: body.certificates
            ? {
                create: body.certificates.map((c, i) => ({
                  name: c.name,
                  issuer: c.issuer,
                  issuedAt: parseDate(c.issuedAt),
                  sortOrder: i,
                })),
              }
            : undefined,
          languages: body.languages
            ? { create: body.languages.map((l, i) => ({ ...l, sortOrder: i })) }
            : undefined,
          skills: body.skills
            ? { create: body.skills.map((s, i) => ({ ...s, sortOrder: i })) }
            : undefined,
        },
        include: {
          careers: true,
          educations: true,
          certificates: true,
          languages: true,
          skills: true,
        },
      });
    });

    return jsonOk(resume, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
