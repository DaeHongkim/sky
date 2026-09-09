import { jsonOk, handleRouteError } from "@/lib/api";
import { requireUser } from "@/lib/auth/session";
import { Role } from "@prisma/client";
import { runVisaExpiryReminders } from "@/lib/jobs/visaReminders";

export async function POST() {
  try {
    await requireUser([Role.ADMIN]);
    const results = await runVisaExpiryReminders();
    return jsonOk({ processed: results.length, results });
  } catch (error) {
    return handleRouteError(error);
  }
}
