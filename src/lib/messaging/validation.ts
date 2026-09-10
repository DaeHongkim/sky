import { z } from "zod";

export const startConversationSchema = z.object({
  applicationId: z.string().trim().min(1).optional(),
  jobPostId: z.string().trim().min(1).optional(),
  // 기업이 먼저 대화를 시작할 때만 필요 (구직자가 시작할 때는 본인 id를 사용).
  jobSeekerId: z.string().trim().min(1).optional(),
});

export const sendMessageSchema = z.object({
  content: z.string().trim().min(1, "메시지를 입력하세요.").max(4000),
});
