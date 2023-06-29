import { VoteType } from "@prisma/client";

export type CachedSpill = {
  id: string;
  spill: string;
  authorUsername: string;
  content: string;
  currentVote: VoteType | null;
  createdAt: Date;
};
