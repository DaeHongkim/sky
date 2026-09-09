import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  handleRouteError,
  jsonOk,
  requireAuth,
} from "@/lib/recruit/api";
import { createNotification } from "@/lib/recruit/audit";

const WINDOWS = [
  { key: "D-90", days: 90 },
  { key: "D-60", days: 60 },
  { key: "D-30", days: 30 },
  { key: "D-14", days: 14 },
  { key: "D-7", days: 7 },
] as const;

/** Cron-friendly endpoint: checks visa expiry windows and emits notifications. */
export async function POST(request: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const auth = request.headers.get("authorization");
      if (auth !== `Bearer ${cronSecret}`) {
        await requireAuth(request, [Role.ADMIN, Role.SUPER_ADMIN]);
      }
    } else {
      await requireAuth(request, [Role.ADMIN, Role.SUPER_ADMIN]);
    }

    const now = new Date();
    const profiles = await prisma.visaProfile.findMany({
      where: { expiryDate: { not: null } },
    });

    let created = 0;
    for (const profile of profiles) {
      if (!profile.expiryDate) continue;
      const daysLeft = Math.ceil(
        (profile.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );
      for (const w of WINDOWS) {
        if (daysLeft === w.days) {
          await createNotification({
            userId: profile.userId,
            type: "VISA_EXPIRY",
            title: `비자 만료 ${w.key} 알림`,
            body: `비자 만료까지 약 ${w.days}일 남았습니다. 공식 확인이 필요합니다.`,
            linkUrl: "/recruit/seeker/visa",
            data: { window: w.key, visaProfileId: profile.id },
          });
          created += 1;
        }
      }
    }
    return jsonOk({ created });
  } catch (e) {
    return handleRouteError(e);
  }
}
