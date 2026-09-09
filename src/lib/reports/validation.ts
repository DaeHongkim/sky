import { z } from "zod";

export const reportCreateSchema = z.object({
  targetType: z.enum(["JOB_POST", "USER", "RESUME", "MESSAGE"]),
  targetId: z.string().trim().min(1).max(200),
  reason: z.string().trim().min(1, "신고 사유를 입력하세요.").max(2000),
});

export const reportReviewSchema = z.object({
  status: z.enum(["REVIEWED", "DISMISSED"]),
  reviewNote: z.string().trim().max(2000).optional(),
});
