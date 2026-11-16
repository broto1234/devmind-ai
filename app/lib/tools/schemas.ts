import { z } from "zod";

export const getDocumentByIdSchema = z.object({
  documentId: z.string().min(1),
});