import { prisma } from "@/lib/db";
import { jsonOk, handleRouteError } from "@/lib/api";
import { generateToken, hashToken } from "@/lib/auth/session";
import { passwordResetRequestSchema } from "@/lib/validation";

/**
 * Issues a password reset token.
 * In production, email the token URL. Dev returns resetToken for testing only when NODE_ENV !== production.
 */
export async function POST(request: Request) {
  try {
    const body = passwordResetRequestSchema.parse(await request.json());
    const user = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
    });

    // Always succeed to avoid email enumeration
    if (!user) return jsonOk({ sent: true });

    const raw = generateToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(raw),
        expiresAt,
      },
    });

    const payload: { sent: boolean; resetToken?: string } = { sent: true };
    if (process.env.NODE_ENV !== "production") {
      payload.resetToken = raw;
    }
    return jsonOk(payload);
  } catch (error) {
    return handleRouteError(error);
  }
}
