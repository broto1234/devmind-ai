import { z } from "zod";

export const documentChunkSchema = z.object({
  documentId: z.string().min(1),
  content: z.string().trim().min(1).max(100000),
});