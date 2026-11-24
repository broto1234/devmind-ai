import { z } from "zod";

export const chatSchema = z.object({
  message: z.string().trim().min(1).max(5000),
  conversationId: z.string().min(1).nullable().optional(),
});