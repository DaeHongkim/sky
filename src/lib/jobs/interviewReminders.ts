/**
 * Interview reminder helper (24h / 1h / 10m before).
 * Intended for cron. Creates notifications only — no auto decisions.
 */
import { prisma } from "@/lib/db";
import { createNotification } from "@/lib/notifications";

const WINDOWS_MIN = [
  { key: "24h", minutes: 24 * 60 },
  { key: "1h", minutes: 60 },
  { key: "10m", minutes: 10 },
] as const;

export async function runInterviewReminders(now = new Date()) {
  const results: Array<{ interviewId: string; window: string }> = [];

  for (const window of WINDOWS_MIN) {
    const from = new Date(now.getTime() + (window.minutes - 2) * 60 * 1000);
    const to = new Date(now.getTime() + (window.minutes + 2) * 60 * 1000);
    const interviews = await prisma.interview.findMany({
      where: {
        status: { in: ["REQUESTED", "CONFIRMED"] },
        scheduledAt: { gte: from, lte: to },
      },
    });

    for (const interview of interviews) {
      await createNotification({
        userId: interview.jobSeekerId,
        type: `INTERVIEW_REMINDER_${window.key}`,
        title: `면접 ${window.key} 전 알림`,
        body: interview.meetingUrl || "면접 일정을 확인해 주세요.",
        linkUrl: "/recruit/my/interviews",
      });
      results.push({ interviewId: interview.id, window: window.key });
    }
  }

  return results;
}
