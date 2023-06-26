import { formatTimeToNow } from "@/lib/utils";
import { Spill, User, Vote } from "@prisma/client";
import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { FC, useRef } from "react";

interface SpillProps {
  companyName: string;
  spill: Spill & {
    author: User;
    votes: Vote[];
  };
  commentAmount: number
}

const Spill: FC<SpillProps> = ({ companyName, spill, commentAmount }) => {
  const sRef = useRef<HTMLDivElement>(null);

  return (
    <div className="rounded-md bg-white shadow">
      <div className="px-6 py-4 flex justify-between">
        {/* TODO: SpillVotes */}

        <div className="w-0 flex-1">
          <div className="max-h-40 mt-1 text-xs text-gray-500">
            {companyName ? (
              <>
                <a
                  className="underline text-zinc-900 text-sm underline-offset-2"
                  href={`/company/${companyName}`}
                >
                  {companyName}
                </a>
                <span className="px-1">-</span>
              </>
            ) : null}
            <span>Posted by {spill.author.username}</span>{" "}
            {formatTimeToNow(new Date(spill.createdAt))}
          </div>
          <a href={`/company/${companyName}/spill/${spill.id}`}>
            <h1 className="text-lg font-semibold py-2 leading-6 text-gray-900">
              {spill.spill}
            </h1>
          </a>
          <div
            className="relative text-sm max-h-40 w-full overflow-clip"
            ref={sRef}
          >
            {sRef.current?.clientHeight === 160 ? (
              <div className="absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-white to-transparent" />
            ) : null}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 z-20 text-sm p-4 sm:px-6">
        <a
          href={`/company/${companyName}/spill/${spill.id}`}
          className="w-fit flex items-center gap-2"
        >
          <MessageSquare className="h-4 w-4"/> {commentAmount} comments
        </a>
      </div>
    </div>
  );
};

export default Spill;
