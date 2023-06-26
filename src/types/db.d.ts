import { Company, Spill, User, Vote, Comment } from "@prisma/client";

export type ExtendedSpill = Spill & {
  company: Company;
  votes: Vote[];
  author: User;
  comments: Comment[];
};
