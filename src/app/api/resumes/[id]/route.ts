import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import {
  handleRouteError,
  jsonOk,
  parseJson,
  requireAuth,
} from "@/lib/recruit/api";
import { resumeCreateSchema } from "@/lib/recruit/validators";
import { isAdminRole } from "@/lib/permissions/roles";

type Ctx = { params: Promise<{ id: string }> };

async function getOwnedResume(userId: string, role: Role, id: string) {
  const resume = await prisma.resume.findUnique({
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
  if (!resume) {
    const err = new Error("NOT_FOUND");
    (err as Error & { status: number }).status = 404;
    throw err;
  }
  if (resume.userId !== userId && !isAdminRole(role)) {
    const err = new Error("FORBIDDEN");
    (err as Error & { status: number }).status = 403;
    throw err;
  }
  return resume;
}

function parseDate(v?: string) {
  if (!v) return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export async function GET(request: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const session = await requireAuth(request);
    const resume = await prisma.resume.findUnique({
      where: { id },
      include: {
        careers: true,
        educations: true,
        certificates: true,
        languages: true,
        skills: true,
        portfolios: true,
        user: { select: { id: true, role: true } },
      },
    });
    if (!resume) {
      const err = new Error("NOT_FOUND");
      (err as Error & { status: number }).status = 404;
      throw err;
    }

    const isOwner = resume.userId === session.user.id;
    const isAdmin = isAdminRole(session.user.role);
    const companyCanView =
      session.user.role === Role.COMPANY && resume.visibility === "PUBLIC";

    if (!isOwner && !isAdmin && !companyCanView) {
      // Company may also view if linked to their application
      if (session.user.role === Role.COMPANY) {
        const company = await prisma.companyProfile.findUnique({
          where: { userId: session.user.id },
        });
        const linked = company
          ? await prisma.application.findFirst({
              where: { resumeId: id, companyId: company.id },
            })
          : null;
        if (!linked) {
          const err = new Error("FORBIDDEN");
          (err as Error & { status: number }).status = 403;
          throw err;
        }
      } else {
        const err = new Error("FORBIDDEN");
        (err as Error & { status: number }).status = 403;
        throw err;
      }
    }

    return jsonOk(resume);
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function PATCH(request: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const { user } = await requireAuth(request, [Role.JOB_SEEKER]);
    await getOwnedResume(user.id, user.role, id);
    const body = await parseJson(request, resumeCreateSchema.partial());

    if (body.isPrimary) {
      await prisma.resume.updateMany({
        where: { userId: user.id },
        data: { isPrimary: false },
      });
    }

    const resume = await prisma.resume.update({
      where: { id },
      data: {
        title: body.title,
        profileSummary: body.profileSummary,
        desiredJob: body.desiredJob,
        desiredLocation: body.desiredLocation,
        desiredSalary: body.desiredSalary,
        employmentType: body.employmentType,
        availableDate: parseDate(body.availableDate),
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
    return jsonOk(resume);
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function DELETE(request: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const { user } = await requireAuth(request, [Role.JOB_SEEKER]);
    await getOwnedResume(user.id, user.role, id);
    await prisma.resume.delete({ where: { id } });
    return jsonOk({ deleted: true });
  } catch (e) {
    return handleRouteError(e);
  }
}
