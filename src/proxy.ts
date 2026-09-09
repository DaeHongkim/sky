import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Optimistic route protection only.
 * Real authorization is enforced in API route handlers / server session checks.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(process.env.SESSION_COOKIE_NAME || "hr_session")?.value);

  const protectedPrefixes = [
    "/recruit/seeker",
    "/recruit/company",
    "/recruit/admin",
    "/recruit/notifications",
  ];

  if (protectedPrefixes.some((p) => pathname.startsWith(p)) && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/recruit/auth/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/recruit/seeker/:path*", "/recruit/company/:path*", "/recruit/admin/:path*", "/recruit/notifications"],
};
