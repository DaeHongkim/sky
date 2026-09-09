import { z } from "zod";

export const interviewCreateSchema = z.object({
  interviewType: z.enum(["ONLINE", "OFFLINE", "PHONE", "AI_PRESCREEN"]),
  scheduledAt: z.string().datetime().or(z.string().min(1)),
  duration: z.number().int().min(5).max(480).optional().nullable(),
  meetingUrl: z.string().trim().url().optional().nullable().or(z.literal("")),
});

export const interviewStatusUpdateSchema = z.object({
  status: z.enum(["CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]),
});
