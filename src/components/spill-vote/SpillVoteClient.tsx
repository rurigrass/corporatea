"use client";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { usePrevious } from "@mantine/hooks";
import { VoteType } from "@prisma/client";
import { FC, useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { SpillVoteRequest } from "@/lib/validators/vote";

interface SpillVoteClientProps {
  spillId: string;
  initialVotesAmount: number;
  initialVote?: VoteType | null;
}

const SpillVoteClient: FC<SpillVoteClientProps> = ({
  spillId,
  initialVotesAmount,
  initialVote,
}) => {
  const { loginToast } = useCustomToast();
  const [votesAmount, setVotesAmount] = useState<number>(initialVotesAmount);
  const [currentVote, setCurrentVote] = useState(initialVote);
  const prevVote = usePrevious(currentVote);

  //this to setCurrentVote quickly
  useEffect(() => {
    setCurrentVote(initialVote);
  }, [initialVote]);

  const {} = useMutation({
    mutationFn: async (voteType: VoteType) => {
        const payload: SpillVoteRequest = {
            spillId,
            voteType
        }
        await axios.patch(`/api/company/spill/vote`, payload)
        // return data as 
    }
  })

  return (
    <div className="flex flex-col gap-0 pr-6 w-20 lpb-0">
      <Button size="sm" variant="ghost" aria-label="upvote">
        <ArrowBigUp
          className={cn("h-5 w-5 text-zinc-700", {
            "text-emerald-500 fill-emerald-500": currentVote === "UP",
          })}
        />
      </Button>
      <p className="text-center py-2 font-medium text-sm text-zinc-900">
        {votesAmount}
      </p>
      <Button size="sm" variant="ghost" aria-label="downvote">
      <ArrowBigDown
          className={cn("h-5 w-5 text-zinc-700", {
            " text-rose-700 fill-rose-700": currentVote === "DOWN",
          })}
        />
      </Button>
    </div>
  );
};

export default SpillVoteClient;
