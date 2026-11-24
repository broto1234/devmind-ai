import { z } from "zod";

export const analyzeDeveloperRequestSchema = z.object({
  message: z.string().trim().min(1).max(5000),
});