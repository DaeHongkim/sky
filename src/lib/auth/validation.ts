import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "비밀번호는 8자 이상이어야 합니다.")
  .max(72, "비밀번호는 72자 이하여야 합니다.")
  .regex(/[A-Za-z]/, "비밀번호에 영문자를 포함해야 합니다.")
  .regex(/[0-9]/, "비밀번호에 숫자를 포함해야 합니다.");

export const jobSeekerSignupSchema = z.object({
  role: z.literal("JOB_SEEKER"),
  email: z.string().trim().toLowerCase().email("올바른 이메일을 입력하세요."),
  password: passwordSchema,
  name: z.string().trim().min(1, "이름을 입력하세요.").max(100),
});

export const companySignupSchema = z.object({
  role: z.literal("COMPANY"),
  email: z.string().trim().toLowerCase().email("올바른 이메일을 입력하세요."),
  password: passwordSchema,
  companyName: z.string().trim().min(1, "회사명을 입력하세요.").max(200),
  businessRegistrationNumber: z
    .string()
    .trim()
    .regex(/^\d{3}-?\d{2}-?\d{5}$/, "사업자번호 형식이 올바르지 않습니다."),
  contactName: z.string().trim().min(1, "담당자명을 입력하세요.").max(100),
  contactPhone: z.string().trim().min(1, "담당자 연락처를 입력하세요."),
});

export const signupSchema = z.discriminatedUnion("role", [
  jobSeekerSignupSchema,
  companySignupSchema,
]);

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
  rememberMe: z.boolean().optional().default(false),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
});
