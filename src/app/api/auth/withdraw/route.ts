import { AccountStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { jsonOk, handleRouteError } from "@/lib/api";
import {
  clearSessionCookie,
  destroySession,
  getSessionToken,
  requireUser,
} from "@/lib/auth/session";
import { writeAuditLog } from "@/lib/notifications";

export async function POST() {
  try {
    const user = await requireUser();
    await prisma.user.update({
      where: { id: user.id },
      data: { status: AccountStatus.WITHDRAWN, deletedAt: new Date() },
    });
    await prisma.session.deleteMany({ where: { userId: user.id } });
    const token = await getSessionToken();
    if (token) await destroySession(token);
    await clearSessionCookie();
    await writeAuditLog({
      actorId: user.id,
      action: "AUTH_WITHDRAW",
      entityType: "User",
      entityId: user.id,
    });
    return jsonOk({ withdrawn: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
