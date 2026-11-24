import { z } from "zod";

export const embeddingSchema = z.object({
  text: z.string().trim().min(1).max(10000),
});