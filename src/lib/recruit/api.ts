import { NextRequest, NextResponse } from "next/server";
import { Role, User } from "@prisma/client";
import { getSessionFromRequest } from "@/lib/auth/session";
import { assertRole } from "@/lib/permissions/roles";
import { ZodError, ZodSchema } from "zod";

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, { status: 200, ...init });
}

export function jsonCreated<T>(data: T) {
  return NextResponse.json({ ok: true, data }, { status: 201 });
}

export function jsonError(
  message: string,
  status = 400,
  extra?: Record<string, unknown>,
) {
  return NextResponse.json(
    { ok: false, error: message, ...extra },
    { status },
  );
}

export async function parseJson<T>(
  request: NextRequest,
  schema: ZodSchema<T>,
): Promise<T> {
  const body = await request.json().catch(() => null);
  return schema.parse(body);
}

export function handleRouteError(error: unknown) {
  if (error instanceof ZodError) {
    return jsonError("VALIDATION_ERROR", 400, {
      issues: error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      })),
    });
  }
  if (error instanceof Error) {
    const status = (error as Error & { status?: number }).status;
    if (status === 401) return jsonError("UNAUTHORIZED", 401);
    if (status === 403) return jsonError(error.message || "FORBIDDEN", 403);
    if (status === 404) return jsonError(error.message || "NOT_FOUND", 404);
    if (status === 409) return jsonError(error.message || "CONFLICT", 409);
    if (
      error.message === "UNAUTHORIZED" ||
      error.message === "FORBIDDEN" ||
      error.message === "ACCOUNT_INACTIVE"
    ) {
      return jsonError(error.message, error.message === "UNAUTHORIZED" ? 401 : 403);
    }
  }
  console.error("[api]", error instanceof Error ? error.message : "unknown");
  return jsonError("INTERNAL_ERROR", 500);
}

export async function requireAuth(
  request: NextRequest,
  allowedRoles?: Role[],
): Promise<{ user: User; sessionId: string }> {
  const session = await getSessionFromRequest(request);
  if (!session) {
    const err = new Error("UNAUTHORIZED");
    (err as Error & { status: number }).status = 401;
    throw err;
  }
  if (allowedRoles?.length) {
    assertRole(session.user.role, allowedRoles);
  }
  return session;
}

export function clientIp(request: NextRequest): string | null {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    null
  );
}
