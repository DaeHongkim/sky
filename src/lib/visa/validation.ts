import { z } from "zod";

const dateOrNull = z
  .string()
  .datetime()
  .or(z.string().date())
  .nullish()
  .transform((v) => (v ? new Date(v) : null));

export const visaProfileUpdateSchema = z.object({
  visaType: z.string().trim().min(1, "비자 종류를 입력하세요.").max(50),
  visaStatus: z.string().trim().min(1, "체류 상태를 입력하세요.").max(50),
  issueDate: dateOrNull,
  expiryDate: dateOrNull,
});

export const visaAdminVerifySchema = z.object({
  verificationStatus: z.enum(["AI_ESTIMATED", "NEEDS_OFFICIAL_CHECK", "ADMIN_VERIFIED"]),
  employmentAllowed: z.boolean(),
});
