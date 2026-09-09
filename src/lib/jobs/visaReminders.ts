import { prisma } from "@/lib/db";
import { createNotification } from "@/lib/notifications";

const WINDOWS = [90, 60, 30, 14, 7] as const;

/**
 * Visa expiry reminder job (D-90/60/30/14/7).
 * Call from cron / scheduled worker. Does not auto-judge visa legality.
 */
export async function runVisaExpiryReminders(now = new Date()) {
  const results: Array<{ userId: string; days: number }> = [];

  for (const days of WINDOWS) {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() + days);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const visas = await prisma.visaProfile.findMany({
      where: {
        expiryDate: { gte: start, lt: end },
      },
    });

    for (const visa of visas) {
      await createNotification({
        userId: visa.userId,
        type: `VISA_EXPIRY_D${days}`,
        title: `비자 만료 D-${days}`,
        body: "비자 만료가 다가옵니다. AI가 적법성을 확정하지 않으며 공식 확인이 필요합니다.",
        linkUrl: "/recruit/my/visa",
        meta: { days, visaType: visa.visaType, label: "OFFICIAL_CONFIRMATION_REQUIRED" },
      });
      results.push({ userId: visa.userId, days });
    }
  }

  return results;
}
