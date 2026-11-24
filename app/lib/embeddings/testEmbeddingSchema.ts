import { z } from "zod";

export const testEmbeddingSchema = z.object({
  text: z.string().trim().min(1).max(10000),
});