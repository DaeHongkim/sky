import { z } from "zod";

const dateOrNull = z
  .string()
  .datetime()
  .or(z.string().date())
  .nullish()
  .transform((v) => (v ? new Date(v) : null));

export const jobPostCreateSchema = z.object({
  title: z.string().trim().min(1, "제목을 입력하세요.").max(200),
  jobCategory: z.string().trim().min(1, "직종을 입력하세요.").max(100),
  description: z.string().trim().min(1, "상세 내용을 입력하세요.").max(8000),
  responsibilities: z.string().trim().max(4000).optional().nullable(),
  requirements: z.string().trim().max(4000).optional().nullable(),
  preferredConditions: z.string().trim().max(4000).optional().nullable(),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "DAILY", "INTERNSHIP", "FREELANCE"]),
  salaryType: z.enum(["HOURLY", "DAILY", "MONTHLY", "ANNUAL", "NEGOTIABLE"]),
  salaryMin: z.number().int().min(0).optional().nullable(),
  salaryMax: z.number().int().min(0).optional().nullable(),
  workLocation: z.string().trim().min(1, "근무지를 입력하세요.").max(200),
  workDays: z.string().trim().max(100).optional().nullable(),
  workHours: z.string().trim().max(100).optional().nullable(),
  breakTime: z.string().trim().max(100).optional().nullable(),
  recruitmentCount: z.number().int().min(1).optional().nullable(),
  deadline: dateOrNull,
  foreignerAllowed: z.boolean().default(false),
  visaConditions: z.array(z.string().trim().min(1).max(50)).max(20).default([]),
  koreanLevel: z.enum(["BASIC", "INTERMEDIATE", "ADVANCED", "NATIVE"]).optional().nullable(),
  housingSupport: z.boolean().default(false),
  mealSupport: z.boolean().default(false),
  transportationSupport: z.boolean().default(false),
});

export const jobPostUpdateSchema = jobPostCreateSchema.partial().extend({
  status: z.enum(["DRAFT", "OPEN", "CLOSED", "EXPIRED"]).optional(),
});
