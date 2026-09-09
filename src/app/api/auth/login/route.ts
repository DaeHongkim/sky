import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { loginSchema } from "@/lib/auth/validation";
import { errorResponse, KnownApiError } from "@/lib/api/respond";
import { isRateLimited, clientIpFromHeaders } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = clientIpFromHeaders(request.headers);
    const body = await request.json();
    const input = loginSchema.parse(body);

    // 이메일 단위 + IP 단위 이중 제한 (브루트포스 방지)
    if (
      isRateLimited(`login:${input.email}`, { windowMs: 5 * 60_000, max: 8 }) ||
      isRateLimited(`login-ip:${ip}`, { windowMs: 5 * 60_000, max: 30 })
    ) {
      throw new KnownApiError(
        "RATE_LIMITED",
        "로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.",
        429
      );
    }

    const user = await prisma.user.findUnique({ where: { email: input.email } });
    const genericError = new KnownApiError(
      "INVALID_CREDENTIALS",
      "이메일 또는 비밀번호가 올바르지 않습니다.",
      401
    );

    if (!user) throw genericError;

    const passwordOk = await verifyPassword(input.password, user.passwordHash);
    if (!passwordOk) throw genericError;

    if (user.status === "WITHDRAWN") {
      throw new KnownApiError("ACCOUNT_WITHDRAWN", "탈퇴한 계정입니다.", 403);
    }
    if (user.status === "SUSPENDED") {
      throw new KnownApiError(
        "ACCOUNT_SUSPENDED",
        "이용이 정지된 계정입니다. 관리자에게 문의하세요.",
        403
      );
    }

    const { token, maxAge } = await createSessionToken(
      { sub: user.id, role: user.role },
      input.rememberMe
    );
    await setSessionCookie(token, maxAge);

    await prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        action: "LOGIN",
        targetType: "User",
        targetId: user.id,
        ipAddress: ip,
      },
    });

    return NextResponse.json({ id: user.id, email: user.email, role: user.role });
  } catch (error) {
    return errorResponse(error);
  }
}
