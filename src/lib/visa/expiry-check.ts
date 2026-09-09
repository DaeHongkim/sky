import "server-only";

import { prisma } from "@/lib/db/prisma";

const WARNING_DAYS = [90, 60, 30, 14, 7];

function startOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/**
 * 비자 만료 D-90/60/30/14/7 알림을 생성한다.
 * 실제 운영에서는 매일 1회 스케줄러(cron)로 호출해야 하며,
 * 이 프로젝트에는 아직 스케줄러가 연결되어 있지 않다 — 관리자가 수동으로 트리거하거나
 * 별도 스케줄러(예: Vercel Cron)를 연결해야 한다.
 */
export async function runVisaExpiryCheck(now: Date = new Date()) {
  const today = startOfDay(now);
  let created = 0;

  for (const days of WARNING_DAYS) {
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + days);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const profiles = await prisma.visaProfile.findMany({
      where: { expiryDate: { gte: targetDate, lt: nextDay } },
    });

    for (const profile of profiles) {
      // 같은 D-day에 대해 이미 알림을 보냈다면 중복 생성하지 않는다.
      const existing = await prisma.notification.findFirst({
        where: {
          userId: profile.userId,
          type: "VISA_EXPIRY_WARNING",
          createdAt: { gte: today },
          body: { contains: `D-${days}` },
        },
      });
      if (existing) continue;

      await prisma.notification.create({
        data: {
          userId: profile.userId,
          type: "VISA_EXPIRY_WARNING",
          title: "비자 만료가 임박했습니다.",
          body: `D-${days}: 비자 만료일이 ${profile.expiryDate?.toLocaleDateString("ko-KR")}입니다.`,
          linkUrl: "/recruit/seeker/visa",
        },
      });
      created += 1;
    }
  }

  return { created };
}
