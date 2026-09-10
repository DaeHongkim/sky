import { z } from "zod";

export const offerCreateSchema = z.object({
  salary: z.number().int().min(0, "급여를 입력하세요."),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "DAILY", "INTERNSHIP", "FREELANCE"]),
  workLocation: z.string().trim().min(1, "근무지를 입력하세요.").max(200),
  startDate: z
    .string()
    .datetime()
    .or(z.string().date())
    .optional()
    .nullable()
    .transform((v) => (v ? new Date(v) : null)),
  workingHours: z.string().trim().max(200).optional().nullable(),
  benefits: z.string().trim().max(2000).optional().nullable(),
});

export const offerRespondSchema = z.object({
  action: z.enum(["ACCEPT", "DECLINE"]),
});
