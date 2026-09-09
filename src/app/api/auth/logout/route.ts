import { NextRequest } from "next/server";
import {
  clearSessionCookie,
  destroySession,
  getSessionFromRequest,
} from "@/lib/auth/session";
import { handleRouteError, jsonOk } from "@/lib/recruit/api";
import { writeAuditLog } from "@/lib/recruit/audit";
import { NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (session) {
      await destroySession(session.sessionId);
      await writeAuditLog({
        userId: session.user.id,
        action: "AUTH_LOGOUT",
        entityType: "User",
        entityId: session.user.id,
      });
    }
    const response = jsonOk({ loggedOut: true });
    clearSessionCookie(response);
    return response;
  } catch (e) {
    return handleRouteError(e);
  }
}
