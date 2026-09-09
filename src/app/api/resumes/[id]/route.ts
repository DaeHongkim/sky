import { Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { requireUser } from "@/lib/auth/session";
import { resumeUpsertSchema } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

function parseDate(value?: string | null) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

async function getOwnedResume(id: string, userId: string) {
  return prisma.resume.findFirst({ where: { id, userId } });
}

export async function GET(_request: Request, ctx: Ctx) {
  try {
    const user = await requireUser([Role.JOB_SEEKER, Role.ADMIN, Role.COMPANY]);
    const { id } = await ctx.params;
    const resume = await prisma.resume.findUnique({
      where: { id },
      include: {
        careers: true,
        educations: true,
        certificates: true,
        languages: true,
        skills: true,
        portfolios: true,
        desiredConditions: true,
        user: { select: { id: true, name: true } },
      },
    });
    if (!resume) return jsonError("NOT_FOUND", 404);

    const isOwner = resume.userId === user.id;
    const isAdmin = user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN;
    if (!isOwner && !isAdmin) {
      if (resume.visibility !== "PUBLIC" || resume.status !== "COMPLETE") {
        return jsonError("FORBIDDEN", 403);
      }
    }

    return jsonOk(resume);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, ctx: Ctx) {
  try {
    const user = await requireUser([Role.JOB_SEEKER]);
    const { id } = await ctx.params;
    const existing = await getOwnedResume(id, user.id);
    if (!existing) return jsonError("NOT_FOUND", 404);

    const body = resumeUpsertSchema.partial().parse(await request.json());

    const resume = await prisma.$transaction(async (tx) => {
      if (body.isPrimary) {
        await tx.resume.updateMany({
          where: { userId: user.id },
          data: { isPrimary: false },
        });
      }

      if (body.careers) {
        await tx.resumeCareer.deleteMany({ where: { resumeId: id } });
        await tx.resumeCareer.createMany({
          data: body.careers.map((c, i) => ({
            resumeId: id,
            companyName: c.companyName,
            jobTitle: c.jobTitle,
            startDate: parseDate(c.startDate),
            endDate: parseDate(c.endDate),
            isCurrent: c.isCurrent ?? false,
            description: c.description,
            leaveReason: c.leaveReason,
            sortOrder: i,
          })),
        });
      }
      if (body.educations) {
        await tx.resumeEducation.deleteMany({ where: { resumeId: id } });
        await tx.resumeEducation.createMany({
          data: body.educations.map((e, i) => ({
            resumeId: id,
            school: e.school,
            major: e.major,
            degree: e.degree,
            startDate: parseDate(e.startDate),
            endDate: parseDate(e.endDate),
            status: e.status,
            sortOrder: i,
          })),
        });
      }
      if (body.certificates) {
        await tx.resumeCertificate.deleteMany({ where: { resumeId: id } });
        await tx.resumeCertificate.createMany({
          data: body.certificates.map((c, i) => ({
            resumeId: id,
            name: c.name,
            issuer: c.issuer,
            issuedAt: parseDate(c.issuedAt),
            sortOrder: i,
          })),
        });
      }
      if (body.languages) {
        await tx.resumeLanguage.deleteMany({ where: { resumeId: id } });
        await tx.resumeLanguage.createMany({
          data: body.languages.map((l, i) => ({
            resumeId: id,
            language: l.language,
            level: l.level,
            sortOrder: i,
          })),
        });
      }
      if (body.skills) {
        await tx.resumeSkill.deleteMany({ where: { resumeId: id } });
        await tx.resumeSkill.createMany({
          data: body.skills.map((s, i) => ({
            resumeId: id,
            name: s.name,
            level: s.level,
            sortOrder: i,
          })),
        });
      }

      return tx.resume.update({
        where: { id },
        data: {
          title: body.title,
          profileSummary: body.profileSummary,
          desiredJob: body.desiredJob,
          desiredLocation: body.desiredLocation,
          desiredSalary: body.desiredSalary,
          employmentType: body.employmentType,
          availableDate: body.availableDate !== undefined ? parseDate(body.availableDate) : undefined,
          visibility: body.visibility,
          status: body.status,
          isPrimary: body.isPrimary,
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

    return jsonOk(resume);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, ctx: Ctx) {
  try {
    const user = await requireUser([Role.JOB_SEEKER]);
    const { id } = await ctx.params;
    const existing = await getOwnedResume(id, user.id);
    if (!existing) return jsonError("NOT_FOUND", 404);
    await prisma.resume.delete({ where: { id } });
    return jsonOk({ deleted: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
