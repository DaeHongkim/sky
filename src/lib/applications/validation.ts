import { z } from "zod";

export const applySchema = z.object({
  resumeId: z.string().min(1, "지원할 이력서를 선택하세요."),
});

export const applicationStatusUpdateSchema = z.object({
  status: z.enum([
    "APPLIED",
    "DOCUMENT_REVIEW",
    "INTERVIEW_REQUESTED",
    "INTERVIEW_SCHEDULED",
    "INTERVIEW_COMPLETED",
    "OFFER",
    "HIRED",
    "REJECTED",
  ]),
  memo: z.string().trim().max(2000).optional(),
});
