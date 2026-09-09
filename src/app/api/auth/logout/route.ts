import { jsonOk, handleRouteError } from "@/lib/api";
import {
  clearSessionCookie,
  destroySession,
  getSessionToken,
} from "@/lib/auth/session";

export async function POST() {
  try {
    const token = await getSessionToken();
    if (token) await destroySession(token);
    await clearSessionCookie();
    return jsonOk({ loggedOut: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
