import { z } from "zod";

export const prescreenAnswersSchema = z.object({
  answers: z.array(z.string().trim().max(4000)).min(1).max(20),
});
