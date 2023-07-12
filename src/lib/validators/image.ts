import { z } from "zod";

export const ImageValidator = z.object({
  fileUrl: z.string().url(),
  fileKey: z.string(),
});

export type ImageRequest = z.infer<typeof ImageValidator>;
