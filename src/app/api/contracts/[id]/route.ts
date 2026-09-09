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
import { createNotification } from "@/lib/recruit/audit";
import { integrityHash } from "@/lib/integrations/hq/hired";

type Ctx = { params: Promise<{ id: string }> };

const actionSchema = z.object({
  action: z.enum(["SEND", "VIEW", "AGREE", "SIGN", "CANCEL"]),
});

export async function GET(request: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const { user } = await requireAuth(request);
    const contract = await prisma.employmentContract.findUnique({
      where: { id },
      include: { company: { select: { companyName: true } } },
    });
    if (!contract) {
      const err = new Error("NOT_FOUND");
      (err as Error & { status: number }).status = 404;
      throw err;
    }
    const company = await prisma.companyProfile.findUnique({
      where: { userId: user.id },
    });
    const allowed =
      contract.jobSeekerId === user.id ||
      (company && company.id === contract.companyId) ||
      user.role === Role.ADMIN ||
      user.role === Role.SUPER_ADMIN;
    if (!allowed) {
      const err = new Error("FORBIDDEN");
      (err as Error & { status: number }).status = 403;
      throw err;
    }
    if (contract.jobSeekerId === user.id && contract.status === "SENT") {
      await prisma.employmentContract.update({
        where: { id },
        data: { status: "VIEWED" },
      });
    }
    return jsonOk(contract);
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function PATCH(request: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const { user } = await requireAuth(request);
    const body = await parseJson(request, actionSchema);
    const contract = await prisma.employmentContract.findUnique({
      where: { id },
      include: { company: true },
    });
    if (!contract) {
      const err = new Error("NOT_FOUND");
      (err as Error & { status: number }).status = 404;
      throw err;
    }

    if (body.action === "SEND") {
      if (user.role !== Role.COMPANY || contract.company.userId !== user.id) {
        const err = new Error("FORBIDDEN");
        (err as Error & { status: number }).status = 403;
        throw err;
      }
      const updated = await prisma.employmentContract.update({
        where: { id },
        data: { status: "SENT" },
      });
      await createNotification({
        userId: contract.jobSeekerId,
        type: "CONTRACT",
        title: "근로계약서가 발송되었습니다",
        linkUrl: "/recruit/seeker/contracts",
      });
      return jsonOk(updated);
    }

    if (body.action === "CANCEL") {
      if (user.role !== Role.COMPANY || contract.company.userId !== user.id) {
        const err = new Error("FORBIDDEN");
        (err as Error & { status: number }).status = 403;
        throw err;
      }
      return jsonOk(
        await prisma.employmentContract.update({
          where: { id },
          data: { status: "CANCELLED" },
        }),
      );
    }

    if (contract.jobSeekerId !== user.id) {
      const err = new Error("FORBIDDEN");
      (err as Error & { status: number }).status = 403;
      throw err;
    }

    if (body.action === "VIEW") {
      return jsonOk(
        await prisma.employmentContract.update({
          where: { id },
          data: { status: "VIEWED" },
        }),
      );
    }
    if (body.action === "AGREE") {
      return jsonOk(
        await prisma.employmentContract.update({
          where: { id },
          data: { status: "AGREED" },
        }),
      );
    }
    if (body.action === "SIGN") {
      const signedAt = new Date();
      const audit = {
        signedAt: signedAt.toISOString(),
        version: contract.version,
        signerUserId: user.id,
        contractId: contract.id,
      };
      const hash = integrityHash(contract.contentOriginal, audit);
      const updated = await prisma.employmentContract.update({
        where: { id },
        data: {
          status: "SIGNED",
          signedAt,
          signedBySeeker: true,
          integrityHash: hash,
          auditJson: JSON.stringify(audit),
        },
      });
      await createNotification({
        userId: contract.company.userId,
        type: "CONTRACT_SIGNED",
        title: "근로계약서가 서명되었습니다",
      });
      return jsonOk(updated);
    }

    const err = new Error("BAD_ACTION");
    (err as Error & { status: number }).status = 400;
    throw err;
  } catch (e) {
    return handleRouteError(e);
  }
}
