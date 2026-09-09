import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  handleRouteError,
  jsonCreated,
  jsonOk,
  parseJson,
  requireAuth,
} from "@/lib/recruit/api";
import { resumeCreateSchema } from "@/lib/recruit/validators";

function parseDate(v?: string) {
  if (!v) return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export async function GET(request: NextRequest) {
  try {
    const { user } = await requireAuth(request, [Role.JOB_SEEKER, Role.ADMIN, Role.SUPER_ADMIN]);
    const resumes = await prisma.resume.findMany({
      where: { userId: user.id },
      include: {
        careers: true,
        educations: true,
        certificates: true,
        languages: true,
        skills: true,
        portfolios: true,
      },
      orderBy: [{ isPrimary: "desc" }, { updatedAt: "desc" }],
    });
    return jsonOk(resumes);
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireAuth(request, [Role.JOB_SEEKER]);
    const body = await parseJson(request, resumeCreateSchema);

    if (body.isPrimary) {
      await prisma.resume.updateMany({
        where: { userId: user.id },
        data: { isPrimary: false },
      });
    }

    const count = await prisma.resume.count({ where: { userId: user.id } });
    const resume = await prisma.resume.create({
      data: {
        userId: user.id,
        title: body.title,
        profileSummary: body.profileSummary,
        desiredJob: body.desiredJob,
        desiredLocation: body.desiredLocation,
        desiredSalary: body.desiredSalary,
        employmentType: body.employmentType,
        availableDate: parseDate(body.availableDate),
        visibility: body.visibility || "PRIVATE",
        status: body.status || "DRAFT",
        isPrimary: body.isPrimary ?? count === 0,
        careers: body.careers
          ? {
              create: body.careers.map((c) => ({
                ...c,
                startDate: parseDate(c.startDate),
                endDate: parseDate(c.endDate),
              })),
            }
          : undefined,
        educations: body.educations
          ? {
              create: body.educations.map((e) => ({
                ...e,
                startDate: parseDate(e.startDate),
                endDate: parseDate(e.endDate),
              })),
            }
          : undefined,
        certificates: body.certificates
          ? {
              create: body.certificates.map((c) => ({
                ...c,
                acquiredAt: parseDate(c.acquiredAt),
              })),
            }
          : undefined,
        languages: body.languages ? { create: body.languages } : undefined,
        skills: body.skills ? { create: body.skills } : undefined,
      },
      include: {
        careers: true,
        educations: true,
        certificates: true,
        languages: true,
        skills: true,
      },
    });
    return jsonCreated(resume);
  } catch (e) {
    return handleRouteError(e);
  }
}
