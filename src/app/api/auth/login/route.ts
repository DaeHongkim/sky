import { AccountStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import {
  createSession,
  setSessionCookie,
  verifyPassword,
} from "@/lib/auth/session";
import { writeAuditLog } from "@/lib/notifications";
import { loginSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = loginSchema.parse(await request.json());
    const user = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
    });

    if (!user || !user.passwordHash) {
      return jsonError("INVALID_CREDENTIALS", 401);
    }
    if (user.status !== AccountStatus.ACTIVE) {
      return jsonError("ACCOUNT_NOT_ACTIVE", 403);
    }

    const valid = await verifyPassword(body.password, user.passwordHash);
    if (!valid) return jsonError("INVALID_CREDENTIALS", 401);

    const { token, expiresAt } = await createSession(user.id, {
      userAgent: request.headers.get("user-agent"),
    });
    await setSessionCookie(token, expiresAt);
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
    await writeAuditLog({
      actorId: user.id,
      action: "AUTH_LOGIN",
      entityType: "User",
      entityId: user.id,
    });

    return jsonOk({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
