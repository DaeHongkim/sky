import { z } from "zod";

export const contractCreateSchema = z.object({
  contentOriginal: z.string().trim().min(1, "계약 내용을 입력하세요.").max(20000),
});
