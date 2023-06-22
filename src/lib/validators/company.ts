import { z } from "zod";

export const CompanyValidator = z.object({
  name: z.string().min(3).max(21),
});

export const CompanyFollowerValidator = z.object({
  companyId: z.string(),
});

export type CreateCompanyPayload = z.infer<typeof CompanyValidator>;
export type FollowCompanyPayload = z.infer<
  typeof CompanyFollowerValidator
>;
