import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";

// 이 파일은 UX 편의를 위한 1차 리다이렉트만 담당한다.
// 실제 권한 검증(role, 계정 상태)은 각 페이지/서버 함수에서 DB를 다시 조회해 수행한다.
// (Next.js 16 권고: Proxy만 신뢰하지 말고 각 서버 함수에서 항상 재검증할 것)

const roleHomePath: Record<string, string> = {
  JOB_SEEKER: "/recruit/seeker",
  COMPANY: "/recruit/company",
  ADMIN: "/recruit/admin",
};

function requiredRoleForPath(pathname: string): "JOB_SEEKER" | "COMPANY" | "ADMIN" | null {
  if (pathname.startsWith("/recruit/seeker")) return "JOB_SEEKER";
  if (pathname.startsWith("/recruit/company")) return "COMPANY";
  if (pathname.startsWith("/recruit/admin")) return "ADMIN";
  return null;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requiredRole = requiredRoleForPath(pathname);
  if (!requiredRole) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    const loginUrl = new URL("/recruit/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session.role !== requiredRole) {
    return NextResponse.redirect(
      new URL(roleHomePath[session.role] ?? "/recruit", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/recruit/seeker/:path*", "/recruit/company/:path*", "/recruit/admin/:path*"],
};
