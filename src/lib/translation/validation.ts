import { z } from "zod";

export const translateRequestSchema = z.object({
  text: z.string().trim().min(1).max(8000),
  targetLanguage: z.string().trim().min(2).max(10),
  sourceType: z.enum(["JOB_POST", "RESUME", "MESSAGE", "INTERVIEW", "OFFER", "CONTRACT"]),
  sourceId: z.string().trim().min(1).max(200),
});
