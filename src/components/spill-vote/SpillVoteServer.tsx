import { Spill, Vote, VoteType } from "@prisma/client";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import SpillVoteClient from "./SpillVoteClient";

interface SpillVoteServerProps {
  spillId: string;
  initialVotesAmount?: number;
  initialVote?: Vote["type"] | null;
  getData?: () => Promise<(Spill & { votes: Vote[] }) | null>;
}

/**
 * We split the SpillVotes into a client and a server component to allow for dynamic data
 * fetching inside of this component, allowing for faster page loads via suspense streaming.
 * We also have to option to fetch this info on a page-level and pass it in.
 *
 */

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

    _currentVote = spill.votes.find(
      (vote) => vote.userId === session?.user.id
    )?.type;
  } else {
    _votesAmount = initialVotesAmount!;
    _currentVote = initialVote;
  }

  return (
    <SpillVoteClient
      spillId={spillId}
      initialVotesAmount={_votesAmount}
      initialVote={_currentVote}
    />
  );
};

export default SpillVoteServer;
