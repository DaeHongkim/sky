import { NextRequest } from "next/server";
import { AccountStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  clearSessionCookie,
  destroySession,
} from "@/lib/auth/session";
import {
  clientIp,
  handleRouteError,
  jsonOk,
  requireAuth,
} from "@/lib/recruit/api";
import { writeAuditLog } from "@/lib/recruit/audit";

export async function POST(request: NextRequest) {
  try {
    const { user, sessionId } = await requireAuth(request);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { status: AccountStatus.WITHDRAWN, email: `withdrawn_${user.id}@invalid.local` },
      }),
      prisma.session.deleteMany({ where: { userId: user.id } }),
    ]);
    await destroySession(sessionId);
    await writeAuditLog({
      userId: user.id,
      action: "AUTH_WITHDRAW",
      entityType: "User",
      entityId: user.id,
      ipAddress: clientIp(request),
    });
    const response = jsonOk({ withdrawn: true });
    clearSessionCookie(response);
    return response;
  } catch (e) {
    return handleRouteError(e);
  }
}
