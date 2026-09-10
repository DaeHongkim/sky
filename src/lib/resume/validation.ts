import { z } from "zod";

const dateOrNull = z
  .string()
  .datetime()
  .or(z.string().date())
  .nullish()
  .transform((v) => (v ? new Date(v) : null));

export const careerInputSchema = z.object({
  companyName: z.string().trim().min(1).max(200),
  position: z.string().trim().max(200).optional().nullable(),
  startDate: dateOrNull,
  endDate: dateOrNull,
  isCurrent: z.boolean().default(false),
  responsibilities: z.string().trim().max(4000).optional().nullable(),
  resignReason: z.string().trim().max(1000).optional().nullable(),
});

export const educationInputSchema = z.object({
  schoolName: z.string().trim().min(1).max(200),
  major: z.string().trim().max(200).optional().nullable(),
  degree: z.string().trim().max(100).optional().nullable(),
  admissionDate: dateOrNull,
  graduationDate: dateOrNull,
  status: z.enum(["ENROLLED", "ON_LEAVE", "GRADUATED", "DROPPED_OUT"]).default("GRADUATED"),
});

export const certificateInputSchema = z.object({
  name: z.string().trim().min(1).max(200),
  issuer: z.string().trim().max(200).optional().nullable(),
  acquiredDate: dateOrNull,
});

export const languageInputSchema = z.object({
  language: z.string().trim().min(1).max(100),
  level: z.enum(["BASIC", "INTERMEDIATE", "ADVANCED", "NATIVE"]),
});

export const portfolioInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  url: z.string().trim().url().optional().nullable().or(z.literal("")),
  description: z.string().trim().max(2000).optional().nullable(),
});

export const resumeCreateSchema = z.object({
  title: z.string().trim().min(1, "이력서 제목을 입력하세요.").max(200),
});

export const resumeUpdateSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  profileSummary: z.string().trim().max(4000).optional().nullable(),
  desiredJob: z.string().trim().max(200).optional().nullable(),
  desiredLocation: z.string().trim().max(200).optional().nullable(),
  desiredSalary: z.number().int().min(0).max(1_000_000_000).optional().nullable(),
  employmentType: z
    .enum(["FULL_TIME", "PART_TIME", "CONTRACT", "DAILY", "INTERNSHIP", "FREELANCE"])
    .optional()
    .nullable(),
  availableDate: dateOrNull,
  skills: z.array(z.string().trim().min(1).max(50)).max(50).optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).optional(),
  status: z.enum(["DRAFT", "COMPLETED"]).optional(),
  careers: z.array(careerInputSchema).max(30).optional(),
  educations: z.array(educationInputSchema).max(20).optional(),
  certificates: z.array(certificateInputSchema).max(30).optional(),
  languages: z.array(languageInputSchema).max(20).optional(),
  portfolios: z.array(portfolioInputSchema).max(20).optional(),
});
