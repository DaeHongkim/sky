import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  generateRawToken,
  hashPassword,
  hashToken,
} from "@/lib/auth/session";
import {
  handleRouteError,
  jsonOk,
  parseJson,
} from "@/lib/recruit/api";
import {
  passwordResetConfirmSchema,
  passwordResetRequestSchema,
} from "@/lib/recruit/validators";
import { writeAuditLog } from "@/lib/recruit/audit";

export async function POST(request: NextRequest) {
  try {
    const body = await parseJson(request, passwordResetRequestSchema);
    const user = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
    });

    // Always return ok to avoid email enumeration.
    if (user) {
      const raw = generateRawToken();
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(raw),
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        },
      });
      // Email provider not wired in beta — token available only in non-production for QA.
      const payload =
        process.env.NODE_ENV === "production"
          ? { sent: true }
          : { sent: true, devResetToken: raw };
      await writeAuditLog({
        userId: user.id,
        action: "AUTH_PASSWORD_RESET_REQUEST",
        entityType: "User",
        entityId: user.id,
      });
      return jsonOk(payload);
    }
    return jsonOk({ sent: true });
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await parseJson(request, passwordResetConfirmSchema);
    const tokenHash = hashToken(body.token);
    const row = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });
    if (!row || row.usedAt || row.expiresAt < new Date()) {
      return jsonOk({ reset: false });
    }
    const passwordHash = await hashPassword(body.password);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: row.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: row.id },
        data: { usedAt: new Date() },
      }),
      prisma.session.deleteMany({ where: { userId: row.userId } }),
    ]);
    await writeAuditLog({
      userId: row.userId,
      action: "AUTH_PASSWORD_RESET_CONFIRM",
      entityType: "User",
      entityId: row.userId,
    });
    return jsonOk({ reset: true });
  } catch (e) {
    return handleRouteError(e);
  }
}
