import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

export function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ ok: false, error: message, details }, { status });
}

export function handleRouteError(error: unknown) {
  if (error instanceof ZodError) {
    return jsonError("VALIDATION_ERROR", 400, error.flatten());
  }
  if (error instanceof Error) {
    const status = (error as Error & { status?: number }).status;
    if (status === 401) return jsonError("UNAUTHORIZED", 401);
    if (status === 403) return jsonError("FORBIDDEN", 403);
    if (status === 404) return jsonError("NOT_FOUND", 404);
    if (error.message === "UNAUTHORIZED") return jsonError("UNAUTHORIZED", 401);
    if (error.message === "FORBIDDEN") return jsonError("FORBIDDEN", 403);
    if (error.message === "NOT_FOUND") return jsonError("NOT_FOUND", 404);
  }
  console.error("[api]", error instanceof Error ? error.message : "unknown");
  return jsonError("INTERNAL_ERROR", 500);
}
