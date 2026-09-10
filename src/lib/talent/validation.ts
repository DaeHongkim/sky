import { z } from "zod";

export const scoutOfferCreateSchema = z.object({
  jobSeekerId: z.string().min(1),
  jobPostId: z.string().min(1).optional().nullable(),
  title: z.string().trim().min(1, "제목을 입력하세요.").max(200),
  message: z.string().trim().min(1, "메시지를 입력하세요.").max(2000),
  expiresAt: z
    .string()
    .datetime()
    .or(z.string().date())
    .optional()
    .nullable()
    .transform((v) => (v ? new Date(v) : null)),
});

export const scoutOfferRespondSchema = z.object({
  action: z.enum(["ACCEPT", "DECLINE"]),
});
