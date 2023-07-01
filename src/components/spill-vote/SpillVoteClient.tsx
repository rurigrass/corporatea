"use client";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { usePrevious } from "@mantine/hooks";
import { VoteType } from "@prisma/client";
import { FC, useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import axios, { Axios, AxiosError } from "axios";
import { SpillVoteRequest } from "@/lib/validators/vote";
import { toast } from "@/hooks/use-toast";

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

  const { mutate: vote } = useMutation({

    // This will make the request
    mutationFn: async (voteType: VoteType) => {
      const payload: SpillVoteRequest = {
        spillId,
        voteType,
      };
      await axios.patch(`/api/company/spill/vote`, payload);
      // return data as
    },

    onError: (err, voteType) => {
      if (voteType === "UP") setVotesAmount((prev) => prev - 1);
      else setVotesAmount((prev) => prev + 1);

      // reset the current vote
      setCurrentVote(prevVote);

      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }
      }

      return toast({
        title: "Something went wrong",
        description: "your vote was not registered, please try again",
        variant: "destructive",
      });
    },

    // these below are gonna change the values on the dom
    onMutate: (type: VoteType) => {
      if (currentVote === type) {
        setCurrentVote(undefined);
        if (type === "UP") setVotesAmount((prev) => prev - 1);
        else if (type === "DOWN") setVotesAmount((prev) => prev + 1);
      } else {
        setCurrentVote(type);
        if (type === "UP")
          setVotesAmount((prev) => prev + (currentVote ? 2 : 1));
        else if (type === "DOWN")
          setVotesAmount((prev) => prev - (currentVote ? 2 : 1));
      }
    },
  });

  return (
    <div className="flex flex-col gap-0 pr-6 w-20 lpb-0">
      <Button
        onClick={() => {
          vote("UP");
        }}
        size="sm"
        variant="ghost"
        aria-label="upvote"
      >
        <ArrowBigUp
          className={cn("h-5 w-5 text-zinc-700", {
            "text-emerald-500 fill-emerald-500": currentVote === "UP",
          })}
        />
      </Button>
      <p className="text-center py-2 font-medium text-sm text-zinc-900">
        {votesAmount}
      </p>
      <Button
        onClick={() => {
          vote("DOWN");
        }}
        size="sm"
        variant="ghost"
        aria-label="downvote"
      >
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
