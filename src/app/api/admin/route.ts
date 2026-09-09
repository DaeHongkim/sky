import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { requireUser } from "@/lib/auth/session";
import { createNotification, writeAuditLog } from "@/lib/notifications";

export async function GET(request: Request) {
  try {
    await requireUser([Role.ADMIN]);
    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section") || "overview";

    if (section === "users") {
      return jsonOk(
        await prisma.user.findMany({
          select: {
            id: true,
            email: true,
            role: true,
            status: true,
            name: true,
            createdAt: true,
            jobSeekerProfile: { select: { nationality: true, koreaResident: true } },
            companyProfile: { select: { companyName: true, verificationStatus: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 200,
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
    if (section === "jobs") {
      return jsonOk(await prisma.jobPost.findMany({ take: 200, orderBy: { createdAt: "desc" } }));
    }
    if (section === "applications") {
      return jsonOk(await prisma.application.findMany({ take: 200, orderBy: { appliedAt: "desc" } }));
    }
    if (section === "visas") {
      return jsonOk(await prisma.visaProfile.findMany({ take: 200, orderBy: { updatedAt: "desc" } }));
    }
    if (section === "scouts") {
      return jsonOk(await prisma.scoutOffer.findMany({ take: 200, orderBy: { createdAt: "desc" } }));
    }
    if (section === "interviews") {
      return jsonOk(await prisma.interview.findMany({ take: 200, orderBy: { createdAt: "desc" } }));
    }
    if (section === "contracts") {
      return jsonOk(await prisma.employmentContract.findMany({ take: 200, orderBy: { createdAt: "desc" } }));
    }
    if (section === "translations") {
      return jsonOk(await prisma.translationUsage.findMany({ take: 200, orderBy: { createdAt: "desc" } }));
    }
    if (section === "notifications") {
      return jsonOk(await prisma.notification.findMany({ take: 200, orderBy: { createdAt: "desc" } }));
    }
    if (section === "reports") {
      return jsonOk(await prisma.report.findMany({ take: 200, orderBy: { createdAt: "desc" } }));
    }
    if (section === "audit") {
      return jsonOk(await prisma.auditLog.findMany({ take: 200, orderBy: { createdAt: "desc" } }));
    }

    const [users, companies, jobs, applications, pendingCompanies] = await Promise.all([
      prisma.user.count(),
      prisma.companyProfile.count(),
      prisma.jobPost.count(),
      prisma.application.count(),
      prisma.companyProfile.count({ where: { verificationStatus: "PENDING" } }),
    ]);

    return jsonOk({ users, companies, jobs, applications, pendingCompanies });
  } catch (error) {
    return handleRouteError(error);
  }
}

const verifySchema = z.object({
  companyId: z.string(),
  status: z.enum(["VERIFIED", "REJECTED"]),
  rejectionReason: z.string().optional(),
});

const visaVerifySchema = z.object({
  userId: z.string(),
  verificationStatus: z.enum(["AI_ESTIMATE", "OFFICIAL_CONFIRMATION_REQUIRED", "ADMIN_VERIFIED"]),
  adminNote: z.string().optional(),
});

export async function PATCH(request: Request) {
  try {
    const admin = await requireUser([Role.ADMIN]);
    const payload = await request.json();
    const action = payload.action as string;

    if (action === "verify_company") {
      const body = verifySchema.parse(payload);
      const company = await prisma.companyProfile.update({
        where: { id: body.companyId },
        data: {
          verificationStatus: body.status,
          verifiedAt: body.status === "VERIFIED" ? new Date() : null,
          rejectionReason: body.rejectionReason,
        },
      });
      await createNotification({
        userId: company.userId,
        type: "COMPANY_VERIFICATION",
        title: body.status === "VERIFIED" ? "기업 인증이 완료되었습니다" : "기업 인증이 거절되었습니다",
        body: body.rejectionReason,
        linkUrl: "/recruit/company",
      });
      await writeAuditLog({
        actorId: admin.id,
        action: "ADMIN_VERIFY_COMPANY",
        entityType: "CompanyProfile",
        entityId: company.id,
        meta: { status: body.status },
      });
      return jsonOk(company);
    }

    if (action === "verify_visa") {
      const body = visaVerifySchema.parse(payload);
      const visa = await prisma.visaProfile.update({
        where: { userId: body.userId },
        data: {
          verificationStatus: body.verificationStatus,
          adminNote: body.adminNote,
        },
      });
      await writeAuditLog({
        actorId: admin.id,
        action: "ADMIN_VERIFY_VISA",
        entityType: "VisaProfile",
        entityId: visa.id,
        meta: { verificationStatus: body.verificationStatus },
      });
      return jsonOk(visa);
    }

    return jsonError("UNKNOWN_ACTION", 400);
  } catch (error) {
    return handleRouteError(error);
  }
}
