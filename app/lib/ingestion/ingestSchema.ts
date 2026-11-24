import { z } from "zod";

export const ingestSchema = z.object({
  documentId: z.string().min(1),
  text: z.string().trim().min(1).max(100000),
});