import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  handleRouteError,
  jsonCreated,
  jsonOk,
  requireAuth,
} from "@/lib/recruit/api";
import { isAdminRole } from "@/lib/permissions/roles";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const { user } = await requireAuth(request, [Role.JOB_SEEKER]);
    const source = await prisma.resume.findUnique({
      where: { id },
      include: {
        careers: true,
        educations: true,
        certificates: true,
        languages: true,
        skills: true,
        portfolios: true,
      },
    });
    if (!source || (source.userId !== user.id && !isAdminRole(user.role))) {
      const err = new Error("FORBIDDEN");
      (err as Error & { status: number }).status = 403;
      throw err;
    }

    const cloned = await prisma.resume.create({
      data: {
        userId: user.id,
        title: `${source.title} (복사)`,
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
          create: source.careers.map(({ id: _i, resumeId: _r, ...c }) => c),
        },
        educations: {
          create: source.educations.map(({ id: _i, resumeId: _r, ...c }) => c),
        },
        certificates: {
          create: source.certificates.map(({ id: _i, resumeId: _r, ...c }) => c),
        },
        languages: {
          create: source.languages.map(({ id: _i, resumeId: _r, ...c }) => c),
        },
        skills: {
          create: source.skills.map(({ id: _i, resumeId: _r, ...c }) => c),
        },
        portfolios: {
          create: source.portfolios.map(({ id: _i, resumeId: _r, ...c }) => c),
        },
      },
    });
    return jsonCreated(cloned);
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function PATCH(request: NextRequest, ctx: Ctx) {
  // Set as primary
  try {
    const { id } = await ctx.params;
    const { user } = await requireAuth(request, [Role.JOB_SEEKER]);
    const resume = await prisma.resume.findUnique({ where: { id } });
    if (!resume || resume.userId !== user.id) {
      const err = new Error("FORBIDDEN");
      (err as Error & { status: number }).status = 403;
      throw err;
    }
    await prisma.$transaction([
      prisma.resume.updateMany({
        where: { userId: user.id },
        data: { isPrimary: false },
      }),
      prisma.resume.update({ where: { id }, data: { isPrimary: true } }),
    ]);
    return jsonOk({ primary: true, id });
  } catch (e) {
    return handleRouteError(e);
  }
}
