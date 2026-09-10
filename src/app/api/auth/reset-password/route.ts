import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { resetPasswordSchema } from "@/lib/auth/validation";
import { errorResponse, KnownApiError } from "@/lib/api/respond";
import { isRateLimited, clientIpFromHeaders } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = clientIpFromHeaders(request.headers);
    if (isRateLimited(`reset-pw:${ip}`, { windowMs: 60_000, max: 10 })) {
      throw new KnownApiError("RATE_LIMITED", "잠시 후 다시 시도해주세요.", 429);
    }

    const { token, password } = resetPasswordSchema.parse(await request.json());
    const tokenHash = createHash("sha256").update(token).digest("hex");

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (
      !resetToken ||
      resetToken.usedAt ||
      resetToken.expiresAt.getTime() < Date.now()
    ) {
      throw new KnownApiError(
        "INVALID_TOKEN",
        "링크가 유효하지 않거나 만료되었습니다. 다시 요청해주세요.",
        400
      );
    }

    const passwordHash = await hashPassword(password);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
      prisma.auditLog.create({
        data: {
          actorUserId: resetToken.userId,
          action: "PASSWORD_RESET",
          targetType: "User",
          targetId: resetToken.userId,
          ipAddress: ip,
        },
      }),
    ]);

    return NextResponse.json({ message: "비밀번호가 재설정되었습니다." });
  } catch (error) {
    return errorResponse(error);
  }
}
