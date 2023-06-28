import { z } from "zod";

export const SpillVoteValidator = z.object({
  spillId: z.string(),
  voteType: z.enum(["UP", "DOWN"]),
});

export type SpillVoteRequest = z.infer<typeof SpillVoteValidator>;

export const CommentVoteValidator = z.object({
  commentId: z.string(),
  voteType: z.enum(["UP", "DOWN"]),
});

export type CommentVoteRequest = z.infer<typeof CommentVoteValidator>;
