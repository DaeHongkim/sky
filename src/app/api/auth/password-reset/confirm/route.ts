import { prisma } from "@/lib/db";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { hashPassword, hashToken } from "@/lib/auth/session";
import { passwordResetConfirmSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = passwordResetConfirmSchema.parse(await request.json());
    const token = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashToken(body.token) },
    });

    if (!token || token.usedAt || token.expiresAt < new Date()) {
      return jsonError("INVALID_OR_EXPIRED_TOKEN", 400);
    }

    const passwordHash = await hashPassword(body.password);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: token.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: token.id },
        data: { usedAt: new Date() },
      }),
      prisma.session.deleteMany({ where: { userId: token.userId } }),
    ]);

    return jsonOk({ reset: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
