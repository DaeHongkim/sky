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
import { writeAuditLog } from "@/lib/recruit/audit";

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request, [Role.ADMIN, Role.SUPER_ADMIN]);
    const section = new URL(request.url).searchParams.get("section") || "overview";

    if (section === "overview") {
      const [
        users,
        seekers,
        companies,
        pendingCompanies,
        jobPosts,
        applications,
        visas,
        translations,
        reports,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: "JOB_SEEKER" } }),
        prisma.user.count({ where: { role: "COMPANY" } }),
        prisma.companyProfile.count({ where: { verificationStatus: "PENDING" } }),
        prisma.jobPost.count(),
        prisma.application.count(),
        prisma.visaProfile.count(),
        prisma.translationUsage.count(),
        prisma.report.count({ where: { status: "OPEN" } }),
      ]);
      return jsonOk({
        users,
        seekers,
        companies,
        pendingCompanies,
        jobPosts,
        applications,
        visas,
        translations,
        reports,
      });
    }

    if (section === "users") {
      return jsonOk(
        await prisma.user.findMany({
          take: 200,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            email: true,
            role: true,
            status: true,
            name: true,
            createdAt: true,
            jobSeekerProfile: { select: { nationality: true, koreaResident: true } },
            companyProfile: {
              select: { companyName: true, verificationStatus: true },
            },
          },
        }),
      );
    }

    if (section === "companies") {
      return jsonOk(
        await prisma.companyProfile.findMany({
          orderBy: { createdAt: "desc" },
          take: 200,
        }),
      );
    }

    if (section === "job-posts") {
      return jsonOk(
        await prisma.jobPost.findMany({
          take: 200,
          orderBy: { createdAt: "desc" },
          include: { company: { select: { companyName: true } } },
        }),
      );
    }

    if (section === "visas") {
      return jsonOk(
        await prisma.visaProfile.findMany({
          take: 200,
          orderBy: { updatedAt: "desc" },
          include: { user: { select: { email: true, name: true } } },
        }),
      );
    }

    if (section === "audit") {
      return jsonOk(
        await prisma.auditLog.findMany({
          take: 200,
          orderBy: { createdAt: "desc" },
        }),
      );
    }

    if (section === "translations") {
      return jsonOk(
        await prisma.translationUsage.findMany({
          take: 200,
          orderBy: { createdAt: "desc" },
        }),
      );
    }

    return jsonOk({ section });
  } catch (e) {
    return handleRouteError(e);
  }
}

const verifySchema = z.object({
  companyId: z.string().min(1),
  status: z.enum(["VERIFIED", "REJECTED", "PENDING"]),
  rejectionReason: z.string().optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const { user } = await requireAuth(request, [Role.ADMIN, Role.SUPER_ADMIN]);
    const action = new URL(request.url).searchParams.get("action");

    if (action === "verify-company") {
      const body = await parseJson(request, verifySchema);
      const updated = await prisma.companyProfile.update({
        where: { id: body.companyId },
        data: {
          verificationStatus: body.status,
          verifiedAt: body.status === "VERIFIED" ? new Date() : null,
          rejectionReason: body.rejectionReason,
        },
      });
      await writeAuditLog({
        userId: user.id,
        action: "ADMIN_VERIFY_COMPANY",
        entityType: "CompanyProfile",
        entityId: body.companyId,
        meta: { status: body.status },
      });
      return jsonOk(updated);
    }

    if (action === "verify-visa") {
      const body = await parseJson(
        request,
        z.object({
          visaProfileId: z.string(),
          status: z.enum(["AI_ESTIMATE", "NEEDS_OFFICIAL_CHECK", "ADMIN_VERIFIED"]),
          adminNote: z.string().optional(),
        }),
      );
      const updated = await prisma.visaProfile.update({
        where: { id: body.visaProfileId },
        data: {
          verificationStatus: body.status,
          adminNote: body.adminNote,
        },
      });
      await writeAuditLog({
        userId: user.id,
        action: "ADMIN_VERIFY_VISA",
        entityType: "VisaProfile",
        entityId: body.visaProfileId,
        meta: { status: body.status },
      });
      return jsonOk(updated);
    }

    const err = new Error("UNKNOWN_ACTION");
    (err as Error & { status: number }).status = 400;
    throw err;
  } catch (e) {
    return handleRouteError(e);
  }
}
