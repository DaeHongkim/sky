import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email().max(200),
  password: z
    .string()
    .min(8)
    .max(100)
    .regex(/[A-Za-z]/, "letter required")
    .regex(/[0-9]/, "number required"),
  role: z.enum(["JOB_SEEKER", "COMPANY"]),
  name: z.string().min(1).max(100).optional(),
  companyName: z.string().min(1).max(200).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(100),
});

export const passwordResetRequestSchema = z.object({
  email: z.string().email(),
});

export const passwordResetConfirmSchema = z.object({
  token: z.string().min(20),
  password: z
    .string()
    .min(8)
    .max(100)
    .regex(/[A-Za-z]/)
    .regex(/[0-9]/),
});

export const resumeCreateSchema = z.object({
  title: z.string().min(1).max(200),
  profileSummary: z.string().max(5000).optional(),
  desiredJob: z.string().max(200).optional(),
  desiredLocation: z.string().max(200).optional(),
  desiredSalary: z.number().int().nonnegative().optional(),
  employmentType: z.string().max(100).optional(),
  availableDate: z.string().datetime().optional().or(z.string().date().optional()),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).optional(),
  status: z.enum(["DRAFT", "COMPLETE"]).optional(),
  isPrimary: z.boolean().optional(),
  careers: z
    .array(
      z.object({
        companyName: z.string().min(1),
        jobTitle: z.string().min(1),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        isCurrent: z.boolean().optional(),
        description: z.string().optional(),
        leaveReason: z.string().optional(),
      }),
    )
    .optional(),
  educations: z
    .array(
      z.object({
        school: z.string().min(1),
        major: z.string().optional(),
        degree: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        status: z.string().optional(),
      }),
    )
    .optional(),
  certificates: z
    .array(
      z.object({
        name: z.string().min(1),
        issuer: z.string().optional(),
        acquiredAt: z.string().optional(),
      }),
    )
    .optional(),
  languages: z
    .array(z.object({ language: z.string(), level: z.string() }))
    .optional(),
  skills: z
    .array(z.object({ name: z.string(), level: z.string().optional() }))
    .optional(),
});

export const jobPostSchema = z.object({
  title: z.string().min(1).max(200),
  jobCategory: z.string().max(100).optional(),
  description: z.string().max(20000).optional(),
  responsibilities: z.string().max(10000).optional(),
  requirements: z.string().max(10000).optional(),
  preferredConditions: z.string().max(10000).optional(),
  employmentType: z.string().max(100).optional(),
  salaryType: z.string().max(50).optional(),
  salaryMin: z.number().int().nonnegative().optional(),
  salaryMax: z.number().int().nonnegative().optional(),
  workLocation: z.string().max(200).optional(),
  workDays: z.string().max(100).optional(),
  workHours: z.string().max(100).optional(),
  breakTime: z.string().max(100).optional(),
  recruitmentCount: z.number().int().positive().optional(),
  deadline: z.string().optional(),
  foreignerAllowed: z.boolean().optional(),
  visaConditions: z.string().max(500).optional(),
  koreanLevel: z.string().max(50).optional(),
  housingSupport: z.boolean().optional(),
  mealSupport: z.boolean().optional(),
  transportationSupport: z.boolean().optional(),
  educationRequirement: z.string().max(100).optional(),
  experienceRequirement: z.string().max(100).optional(),
  status: z.enum(["DRAFT", "OPEN", "CLOSED", "EXPIRED"]).optional(),
});
