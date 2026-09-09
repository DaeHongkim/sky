import { createHash } from "crypto";
import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { requireUser } from "@/lib/auth/session";
import { emitHireCompleted } from "@/lib/integrations/hq";
import { createNotification, writeAuditLog } from "@/lib/notifications";

const createSchema = z.object({
  applicationId: z.string(),
  offerId: z.string().optional().nullable(),
  title: z.string().min(1),
  originalContent: z.string().min(1),
  translatedContent: z.string().optional().nullable(),
  translationLang: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const user = await requireUser([Role.JOB_SEEKER, Role.COMPANY, Role.ADMIN]);
    if (user.role === Role.JOB_SEEKER) {
      return jsonOk(
        await prisma.employmentContract.findMany({
          where: { jobSeekerId: user.id },
          orderBy: [{ applicationId: "asc" }, { version: "desc" }],
        }),
      );
    }
    if (user.role === Role.COMPANY) {
      const company = await prisma.companyProfile.findUnique({ where: { userId: user.id } });
      if (!company) return jsonOk([]);
      return jsonOk(
        await prisma.employmentContract.findMany({
          where: { companyId: company.id },
          orderBy: [{ applicationId: "asc" }, { version: "desc" }],
        }),
      );
    }
    return jsonOk(await prisma.employmentContract.findMany({ take: 200, orderBy: { createdAt: "desc" } }));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser([Role.COMPANY]);
    const company = await prisma.companyProfile.findUnique({ where: { userId: user.id } });
    if (!company) return jsonError("FORBIDDEN", 403);
    const body = createSchema.parse(await request.json());

    const application = await prisma.application.findFirst({
      where: { id: body.applicationId, companyId: company.id },
    });
    if (!application) return jsonError("NOT_FOUND", 404);

    const latest = await prisma.employmentContract.findFirst({
      where: { applicationId: application.id },
      orderBy: { version: "desc" },
    });
    const version = (latest?.version ?? 0) + 1;

    const contract = await prisma.employmentContract.create({
      data: {
        applicationId: application.id,
        companyId: company.id,
        jobSeekerId: application.jobSeekerId,
        offerId: body.offerId,
        version,
        title: body.title,
        originalContent: body.originalContent,
        translatedContent: body.translatedContent,
        translationLang: body.translationLang,
        status: "DRAFT",
      },
    });

    return jsonOk(contract, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
