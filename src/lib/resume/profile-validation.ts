import { z } from "zod";

const dateOrNull = z
  .string()
  .datetime()
  .or(z.string().date())
  .nullish()
  .transform((v) => (v ? new Date(v) : null));

export const seekerProfileUpdateSchema = z.object({
  name: z.string().trim().min(1).max(100),
  profileImageUrl: z.string().trim().url().optional().nullable().or(z.literal("")),
  birthDate: dateOrNull,
  gender: z.enum(["MALE", "FEMALE", "UNSPECIFIED"]).optional().nullable(),
  phone: z.string().trim().max(30).optional().nullable(),
  residenceRegion: z.string().trim().max(100).optional().nullable(),
  desiredRegion: z.string().trim().max(100).optional().nullable(),
  desiredJobCategory: z.string().trim().max(100).optional().nullable(),
  desiredSalaryMin: z.number().int().min(0).optional().nullable(),
  desiredSalaryMax: z.number().int().min(0).optional().nullable(),
  desiredEmploymentType: z
    .enum(["FULL_TIME", "PART_TIME", "CONTRACT", "DAILY", "INTERNSHIP", "FREELANCE"])
    .optional()
    .nullable(),
  availableFrom: dateOrNull,
  selfIntroduction: z.string().trim().max(4000).optional().nullable(),
  skills: z.array(z.string().trim().min(1).max(50)).max(50).optional(),
  careerYears: z.number().int().min(0).max(80).optional().nullable(),
  nationality: z.string().trim().max(100).optional().nullable(),
  nativeLanguage: z.string().trim().max(100).optional().nullable(),
  currentCountry: z.string().trim().max(100).optional().nullable(),
  koreaResident: z.boolean().optional(),
  koreaLocation: z.string().trim().max(100).optional().nullable(),
  koreanLevel: z.enum(["BASIC", "INTERMEDIATE", "ADVANCED", "NATIVE"]).optional().nullable(),
  englishLevel: z.enum(["BASIC", "INTERMEDIATE", "ADVANCED", "NATIVE"]).optional().nullable(),
  preferredLanguage: z.string().trim().max(100).optional().nullable(),
  autoTranslateEnabled: z.boolean().optional(),
});
