import { z } from "zod";

export const SpillValidator = z.object({
  spill: z
    .string()
    .min(3, { message: "Spill must be longer than 3 characters" })
    .max(280, { message: "Tea must be less than 280 characters" }),
  companyId: z.string(),
  deets: z.any(),
});

export type SpillCreationRequest = z.infer<typeof SpillValidator>;
