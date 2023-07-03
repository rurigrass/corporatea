import { Spill, Vote, VoteType } from "@prisma/client";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";

interface SpillVoteServerProps {
  spillId: string;
  initialVotesAmount?: number;
  initialVote?: number | null;
  getData?: () => Promise<Spill & { votes: Vote[] }> | null;
}

const SpillVoteServer = async ({
  spillId,
  initialVotesAmount,
  initialVote,
  getData,
}: SpillVoteServerProps) => {
  const session = await getServerSession();
  let _votesAmount: number = 0;
  let _currentVote: VoteType | null | undefined = undefined;

  if (getData) {
    const spill = await getData();
    if (!spill) return notFound();

    _votesAmount = spill.votes.reduce((acc, vote) => {
      if (vote.type === "UP") return acc + 1;
      if (vote.type === "DOWN") return acc - 1;
      return acc;
    }, 0);
  }

  return <div>SpillVoteServer</div>;
};

export default SpillVoteServer;
