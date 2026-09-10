import "server-only";

import { redirect } from "next/navigation";
import { getCurrentUser, type CurrentUser } from "@/lib/auth/current-user";
import type { Role } from "@/generated/prisma/enums";

/**
 * 서버 컴포넌트(page.tsx)에서 사용하는 가드.
 * Proxy(구 middleware)의 리다이렉트는 UX 보조용일 뿐이므로,
 * 실제 페이지 렌더링 직전에도 DB 기준으로 다시 검증한다.
 */
export async function requirePageUser(
  allowedRoles: Role[],
  redirectTo: string = "/recruit/login"
): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user || !allowedRoles.includes(user.role)) {
    redirect(redirectTo);
  }
  return user;
}
