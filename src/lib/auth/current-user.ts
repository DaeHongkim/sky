import "server-only";

import { prisma } from "@/lib/db/prisma";
import { readSessionFromCookies } from "@/lib/auth/session";
import type { Role } from "@/generated/prisma/enums";

/**
 * 세션 쿠키가 유효해도, 매 요청마다 DB에서 계정 상태를 다시 확인한다.
 * 이렇게 해야 관리자가 계정을 정지/탈퇴 처리한 순간부터 즉시 반영된다
 * (서명된 JWT만으로는 상태 변경을 되돌릴 수 없음).
 */
export async function getCurrentUser() {
  const session = await readSessionFromCookies();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  if (!user || user.status !== "ACTIVE") return null;
  // JWT에 담긴 role과 DB의 role이 다르면(관리자가 역할을 바꾼 경우) DB 값을 신뢰한다.
  return user;
}

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

export class UnauthorizedError extends Error {
  status = 401;
}
export class ForbiddenError extends Error {
  status = 403;
}

/** API route handler에서 사용: 로그인 필요 + (선택) 역할 제한을 서버에서 강제한다. */
export async function requireUser(allowedRoles?: Role[]): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError("로그인이 필요합니다.");
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw new ForbiddenError("접근 권한이 없습니다.");
  }
  return user;
}
