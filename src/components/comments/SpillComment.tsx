"use client";
import { formatTimeToNow } from "@/lib/utils";
import { Comment, CommentVote, User } from "@prisma/client";
import { FC, useRef } from "react";
import UserAvatar from "../user/UserAvatar";
import CommentVoteClient from "./CommentVoteClient";
import { Button } from "../ui/Button";
import { MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type ExtendedComment = Comment & {
  votes: CommentVote[];
  author: User;
};

interface SpillCommentProps {
  comment: ExtendedComment;
  votesAmount: number;
  currentVote: CommentVote | undefined;
  spillId: string;
}

const SpillComment: FC<SpillCommentProps> = ({
  comment,
  votesAmount,
  currentVote,
  spillId,
}) => {
  const router = useRouter();
  const { data: session } = useSession();
  //this ref will close the comment input when clicked outside of it
  const commentRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col" ref={commentRef}>
      <div className="flex items-center">
        <UserAvatar
          user={{
            name: comment.author.name || null,
            image: comment.author.image || null,
          }}
          className="h-6 w-6"
        />
        <div className="ml-2 flex items-center gap-x-2">
          <p className="text-sm font-medium text-gray-900">
            {comment.author.username}
          </p>
          <p className="max-h-40 truncate text-xs text-zinc-500">
            {formatTimeToNow(new Date(comment.createdAt))}
          </p>
        </div>
      </div>

      <p className="text-sm text-zinc-900 mt-2">{comment.text}</p>

      <div className="flex gap-2 items-center">
        <CommentVoteClient
          commentId={comment.commentId || ""}
          initialVotesAmount={votesAmount}
          initialVote={currentVote}
        />

        <Button
          onClick={() => {
            if (!session) return router.push("/sign-in");
          }}
          variant="ghost"
          size="xs"
        >
          <MessageSquare className="h-4 w-4 mr-1.5" />
          Reply
        </Button>
      </div>
    </div>
  );
};

export default SpillComment;
