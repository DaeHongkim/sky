import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import {
  handleRouteError,
  jsonCreated,
  jsonOk,
  parseJson,
  requireAuth,
} from "@/lib/recruit/api";
import { createNotification } from "@/lib/recruit/audit";
import { integrityHash } from "@/lib/integrations/hq/hired";

const createSchema = z.object({
  applicationId: z.string().min(1),
  jobOfferId: z.string().optional(),
  title: z.string().min(1).max(200),
  contentOriginal: z.string().min(1),
  contentTranslated: z.string().optional(),
  translationLang: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { user } = await requireAuth(request);
    if (user.role === Role.JOB_SEEKER) {
      return jsonOk(
        await prisma.employmentContract.findMany({
          where: { jobSeekerId: user.id },
          orderBy: [{ applicationId: "asc" }, { version: "desc" }],
        }),
      );
    }
    if (user.role === Role.COMPANY) {
      const company = await prisma.companyProfile.findUnique({
        where: { userId: user.id },
      });
      if (!company) return jsonOk([]);
      return jsonOk(
        await prisma.employmentContract.findMany({
          where: { companyId: company.id },
          orderBy: [{ applicationId: "asc" }, { version: "desc" }],
        }),
      );
    }
    const err = new Error("FORBIDDEN");
    (err as Error & { status: number }).status = 403;
    throw err;
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireAuth(request, [Role.COMPANY]);
    const company = await prisma.companyProfile.findUnique({
      where: { userId: user.id },
    });
    if (!company) {
      const err = new Error("COMPANY_PROFILE_MISSING");
      (err as Error & { status: number }).status = 400;
      throw err;
    }
    const body = await parseJson(request, createSchema);
    const app = await prisma.application.findUnique({
      where: { id: body.applicationId },
    });
    if (!app || app.companyId !== company.id) {
      const err = new Error("FORBIDDEN");
      (err as Error & { status: number }).status = 403;
      throw err;
    }

    const latest = await prisma.employmentContract.findFirst({
      where: { applicationId: app.id },
      orderBy: { version: "desc" },
    });
    const version = (latest?.version || 0) + 1;

    const contract = await prisma.employmentContract.create({
      data: {
        applicationId: app.id,
        companyId: company.id,
        jobSeekerId: app.jobSeekerId,
        jobOfferId: body.jobOfferId,
        version,
        title: body.title,
        contentOriginal: body.contentOriginal,
        contentTranslated: body.contentTranslated,
        translationLang: body.translationLang,
        status: "DRAFT",
      },
    });
    return jsonCreated(contract);
  } catch (e) {
    return handleRouteError(e);
  }
}
