import { NextRequest, NextResponse } from "next/server";
import { randomBytes, createHash } from "crypto";
import { prisma } from "@/lib/db/prisma";
import { forgotPasswordSchema } from "@/lib/auth/validation";
import { errorResponse, KnownApiError } from "@/lib/api/respond";
import { isRateLimited, clientIpFromHeaders } from "@/lib/rate-limit";
import { getEmailProvider } from "@/lib/email/provider";

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000; // 30분

export async function POST(request: NextRequest) {
  try {
    const ip = clientIpFromHeaders(request.headers);
    if (isRateLimited(`forgot-pw:${ip}`, { windowMs: 60_000, max: 5 })) {
      throw new KnownApiError("RATE_LIMITED", "잠시 후 다시 시도해주세요.", 429);
    }

    const { email } = forgotPasswordSchema.parse(await request.json());
    const user = await prisma.user.findUnique({ where: { email } });

    // 계정 존재 여부와 무관하게 응답은 항상 동일해야 한다(이메일 존재 유추 방지).
    let devResetUrl: string | undefined;

    if (user && user.status === "ACTIVE") {
      const rawToken = randomBytes(32).toString("hex");
      const tokenHash = createHash("sha256").update(rawToken).digest("hex");

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
        },
      });

      const resetUrl = `${request.nextUrl.origin}/recruit/reset-password?token=${rawToken}`;
      await getEmailProvider().send({
        to: user.email,
        subject: "[HIHONG RECRUIT] 비밀번호 재설정",
        html: `<p>아래 링크에서 비밀번호를 재설정하세요. 30분 후 만료됩니다.</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
      });

      // 개발 환경에서는 실제 메일 발송 연동이 없으므로, 테스트 편의를 위해서만 링크를 응답에 포함한다.
      if (process.env.NODE_ENV !== "production") {
        devResetUrl = resetUrl;
      }
    }

    return NextResponse.json({
      message: "해당 이메일로 가입된 계정이 있다면 재설정 링크를 발송했습니다.",
      ...(devResetUrl ? { devResetUrl } : {}),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
