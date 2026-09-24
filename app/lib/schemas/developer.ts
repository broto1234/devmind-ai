import { z } from "zod";

export const developerSchema = z.object({
  name: z.string(),
  experienceLevel: z.enum([
    "junior",
    "mid",
    "senior",
  ]),
  skills: z.array(z.string()),
  summary: z.string(),
});