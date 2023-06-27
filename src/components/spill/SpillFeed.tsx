"use client";

import { ExtendedSpill } from "@/types/db";
import { FC, useRef } from "react";
import { useIntersection } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config";
import axios from "axios";
import { useSession } from "next-auth/react";
import Spill from "./Spill";

interface SpillFeedProps {
  //   spills: SpillProps[]
  initialSpills: ExtendedSpill[];
  companyName?: string;
}

const SpillFeed: FC<SpillFeedProps> = ({ initialSpills, companyName }) => {
  const lastSpillRef = useRef<HTMLElement>(null);

  // infinite scroll
  const { ref, entry } = useIntersection({
    root: lastSpillRef.current,
    threshold: 1,
  });

  //fetch session client side
  const { data: session } = useSession();

  const { data, fetchNextPage, isFetchingNextPage } = useInfiniteQuery(
    ["infinite-query"],
    async ({ pageParam = 1 }) => {
      const query =
        `/api/spills?limit=${INFINITE_SCROLLING_PAGINATION_RESULTS}&page=${pageParam}` +
        (!!companyName ? `&companyName=${companyName}` : "");

      const { data } = await axios.get(query);
      return data as ExtendedSpill[];
    },
    {
      getNextPageParam: (_, pages) => {
        return pages.length + 1;
      },
      initialData: { pages: [initialSpills], pageParams: [1] },
    }
  );

  // ?? only returns if previous value is null or undefined
  const spills = data?.pages.flatMap((page) => page) ?? initialSpills;

  return (
    <ul className="flex flex-col col-span-2 space-y-6">
      {spills.map((spill, index) => {
        const votesAmount = spill.votes.reduce((acc, vote) => {
          if (vote.type === "UP") return acc + 1;
          if (vote.type === "DOWN") return acc - 1;
          return acc;
        }, 0);
        //See if user has voted for this spill
        const currentVote = spill.votes.find(
          (vote) => vote.userId === session?.user.id
        );

        if (index === spills.length - 1) {
          return (
            <li key={spill.id} ref={ref}>
              <Spill
                companyName={spill.company.name}
                spill={spill}
                commentAmount={spill.comments.length}
                currentVote={currentVote}
                votesAmount={votesAmount}
              />
            </li>
          );
        } else {
          return (
            <Spill
              key={spill.id}
              companyName={spill.company.name}
              spill={spill}
              commentAmount={spill.comments.length}
              currentVote={currentVote}
              votesAmount={votesAmount}
            />
          );
        }
      })}
    </ul>
  );
};

export default SpillFeed;
