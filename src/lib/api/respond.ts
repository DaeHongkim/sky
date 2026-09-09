import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { UnauthorizedError, ForbiddenError } from "@/lib/auth/current-user";

export function errorResponse(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: error.issues[0]?.message ?? "입력값이 올바르지 않습니다.", issues: error.issues },
      { status: 400 }
    );
  }
  if (error instanceof UnauthorizedError) {
    return NextResponse.json({ error: "UNAUTHORIZED", message: error.message }, { status: 401 });
  }
  if (error instanceof ForbiddenError) {
    return NextResponse.json({ error: "FORBIDDEN", message: error.message }, { status: 403 });
  }
  if (error instanceof KnownApiError) {
    return NextResponse.json(
      { error: error.code, message: error.message },
      { status: error.status }
    );
  }

  console.error("[api] unhandled error", error);
  return NextResponse.json(
    { error: "INTERNAL_ERROR", message: "서버 오류가 발생했습니다." },
    { status: 500 }
  );
}

export class KnownApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 400
  ) {
    super(message);
  }
}
