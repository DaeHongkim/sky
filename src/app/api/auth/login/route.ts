import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  clientIp,
  handleRouteError,
  jsonError,
  jsonOk,
  parseJson,
} from "@/lib/recruit/api";
import { loginSchema } from "@/lib/recruit/validators";
import {
  createUserSession,
  setSessionCookie,
  verifyPassword,
} from "@/lib/auth/session";
import { writeAuditLog } from "@/lib/recruit/audit";
import { AccountStatus } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await parseJson(request, loginSchema);
    const user = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
    });
    if (!user?.passwordHash) {
      return jsonError("INVALID_CREDENTIALS", 401);
    }
    const valid = await verifyPassword(body.password, user.passwordHash);
    if (!valid) {
      return jsonError("INVALID_CREDENTIALS", 401);
    }
    if (user.status !== AccountStatus.ACTIVE) {
      return jsonError("ACCOUNT_INACTIVE", 403);
    }

    const { token, expiresAt } = await createUserSession({
      user,
      userAgent: request.headers.get("user-agent"),
      ipAddress: clientIp(request),
    });

    await writeAuditLog({
      userId: user.id,
      action: "AUTH_LOGIN",
      entityType: "User",
      entityId: user.id,
      ipAddress: clientIp(request),
    });

    const response = jsonOk({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });
    setSessionCookie(response, token, expiresAt);
    return response;
  } catch (e) {
    return handleRouteError(e);
  }
}
