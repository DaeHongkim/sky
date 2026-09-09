import { createHash } from "crypto";
import { Prisma, Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { requireUser } from "@/lib/auth/session";
import { emitHireCompleted } from "@/lib/integrations/hq";
import { createNotification, writeAuditLog } from "@/lib/notifications";

type Ctx = { params: Promise<{ id: string }> };

const actionSchema = z.object({
  action: z.enum(["SEND", "VIEW", "AGREE", "SIGN", "CANCEL"]),
  signatureName: z.string().optional(),
});

export async function PATCH(request: Request, ctx: Ctx) {
  try {
    const user = await requireUser([Role.JOB_SEEKER, Role.COMPANY]);
    const { id } = await ctx.params;
    const body = actionSchema.parse(await request.json());

    const contract = await prisma.employmentContract.findUnique({
      where: { id },
      include: { company: true },
    });
    if (!contract) return jsonError("NOT_FOUND", 404);

    const isSeeker = user.role === Role.JOB_SEEKER && contract.jobSeekerId === user.id;
    const isCompany = user.role === Role.COMPANY && contract.company.userId === user.id;
    if (!isSeeker && !isCompany) return jsonError("FORBIDDEN", 403);

    const now = new Date();
    let data: Prisma.EmploymentContractUpdateInput = {};

    if (body.action === "SEND") {
      if (!isCompany) return jsonError("FORBIDDEN", 403);
      data = { status: "SENT", sentAt: now };
    } else if (body.action === "VIEW") {
      if (!isSeeker) return jsonError("FORBIDDEN", 403);
      data = { status: contract.status === "SENT" ? "VIEWED" : contract.status, viewedAt: now };
    } else if (body.action === "AGREE") {
      if (!isSeeker) return jsonError("FORBIDDEN", 403);
      data = { status: "AGREED", agreedAt: now };
    } else if (body.action === "SIGN") {
      if (!isSeeker) return jsonError("FORBIDDEN", 403);
      const integrityHash = createHash("sha256")
        .update(
          `${contract.id}|v${contract.version}|${contract.originalContent}|${user.id}|${now.toISOString()}`,
        )
        .digest("hex");
      data = {
        status: "SIGNED",
        signedAt: now,
        integrityHash,
        signatureMeta: {
          signerId: user.id,
          signatureName: body.signatureName || user.name || user.email,
          signedAt: now.toISOString(),
          version: contract.version,
          userAgent: request.headers.get("user-agent"),
        },
      };
    } else if (body.action === "CANCEL") {
      if (!isCompany) return jsonError("FORBIDDEN", 403);
      data = { status: "CANCELLED", cancelledAt: now };
    }

    const updated = await prisma.employmentContract.update({
      where: { id },
      data,
    });

    await writeAuditLog({
      actorId: user.id,
      action: `CONTRACT_${body.action}`,
      entityType: "EmploymentContract",
      entityId: id,
      meta: { version: contract.version },
    });

    if (body.action === "SEND") {
      await createNotification({
        userId: contract.jobSeekerId,
        type: "CONTRACT",
        title: "전자근로계약서가 도착했습니다",
        body: `V${contract.version} ${contract.title}`,
        linkUrl: "/recruit/my/contracts",
      });
    }

    if (body.action === "SIGN") {
      await prisma.application.update({
        where: { id: contract.applicationId },
        data: { status: "HIRED" },
      });
      await prisma.applicationHistory.create({
        data: {
          applicationId: contract.applicationId,
          fromStatus: "OFFER",
          toStatus: "HIRED",
          changedById: user.id,
          note: `계약 서명 완료 V${contract.version}`,
        },
      });
      await emitHireCompleted(contract.applicationId);
      await createNotification({
        userId: contract.company.userId,
        type: "HIRED",
        title: "계약 서명 및 채용확정",
        body: contract.title,
        linkUrl: "/recruit/company/applicants",
      });
      await createNotification({
        userId: contract.jobSeekerId,
        type: "HIRED",
        title: "채용이 확정되었습니다",
        linkUrl: "/recruit/my/contracts",
      });
    }

    return jsonOk(updated);
  } catch (error) {
    return handleRouteError(error);
  }
}
