import { z } from "zod";
import { Role } from "@prisma/client";

export const signupSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Za-z]/)
    .regex(/[0-9]/),
  name: z.string().min(1).max(80),
  role: z.enum([Role.JOB_SEEKER, Role.COMPANY]),
  companyName: z.string().min(1).max(120).optional(),
  businessNumber: z.string().max(40).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const passwordResetRequestSchema = z.object({
  email: z.string().email(),
});

export const passwordResetConfirmSchema = z.object({
  token: z.string().min(10),
  password: z
    .string()
    .min(8)
    .regex(/[A-Za-z]/)
    .regex(/[0-9]/),
});

export const resumeUpsertSchema = z.object({
  title: z.string().min(1).max(120),
  profileSummary: z.string().max(5000).optional().nullable(),
  desiredJob: z.string().max(120).optional().nullable(),
  desiredLocation: z.string().max(120).optional().nullable(),
  desiredSalary: z.number().int().nonnegative().optional().nullable(),
  employmentType: z.string().max(60).optional().nullable(),
  availableDate: z.string().optional().nullable(),
  visibility: z.enum(["PRIVATE", "PUBLIC"]).optional(),
  status: z.enum(["DRAFT", "COMPLETE"]).optional(),
  isPrimary: z.boolean().optional(),
  careers: z
    .array(
      z.object({
        companyName: z.string().min(1),
        jobTitle: z.string().min(1),
        startDate: z.string().optional().nullable(),
        endDate: z.string().optional().nullable(),
        isCurrent: z.boolean().optional(),
        description: z.string().optional().nullable(),
        leaveReason: z.string().optional().nullable(),
      }),
    )
    .optional(),
  educations: z
    .array(
      z.object({
        school: z.string().min(1),
        major: z.string().optional().nullable(),
        degree: z.string().optional().nullable(),
        startDate: z.string().optional().nullable(),
        endDate: z.string().optional().nullable(),
        status: z.string().optional().nullable(),
      }),
    )
    .optional(),
  certificates: z
    .array(
      z.object({
        name: z.string().min(1),
        issuer: z.string().optional().nullable(),
        issuedAt: z.string().optional().nullable(),
      }),
    )
    .optional(),
  languages: z
    .array(z.object({ language: z.string().min(1), level: z.string().min(1) }))
    .optional(),
  skills: z.array(z.object({ name: z.string().min(1), level: z.string().optional().nullable() })).optional(),
});

export const jobPostUpsertSchema = z.object({
  title: z.string().min(1).max(200),
  jobCategory: z.string().max(100).optional().nullable(),
  description: z.string().min(1),
  responsibilities: z.string().optional().nullable(),
  requirements: z.string().optional().nullable(),
  preferredConditions: z.string().optional().nullable(),
  employmentType: z.string().optional().nullable(),
  salaryType: z.string().optional().nullable(),
  salaryMin: z.number().int().nonnegative().optional().nullable(),
  salaryMax: z.number().int().nonnegative().optional().nullable(),
  workLocation: z.string().optional().nullable(),
  workDays: z.string().optional().nullable(),
  workHours: z.string().optional().nullable(),
  breakTime: z.string().optional().nullable(),
  recruitmentCount: z.number().int().positive().optional(),
  deadline: z.string().optional().nullable(),
  foreignerAllowed: z.boolean().optional(),
  visaConditions: z.string().optional().nullable(),
  koreanLevel: z.string().optional().nullable(),
  housingSupport: z.boolean().optional(),
  mealSupport: z.boolean().optional(),
  transportationSupport: z.boolean().optional(),
  educationRequirement: z.string().optional().nullable(),
  careerRequirement: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "OPEN", "CLOSED", "EXPIRED"]).optional(),
});

export const applySchema = z.object({
  resumeId: z.string().min(1),
});

export const applicationStatusSchema = z.object({
  status: z.enum([
    "APPLIED",
    "DOCUMENT_REVIEW",
    "INTERVIEW_REQUESTED",
    "INTERVIEW_SCHEDULED",
    "INTERVIEW_COMPLETED",
    "OFFER",
    "HIRED",
    "REJECTED",
    "WITHDRAWN",
  ]),
  note: z.string().max(2000).optional(),
  memo: z.string().max(5000).optional(),
});
