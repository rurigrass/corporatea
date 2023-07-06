"use client";
import { formatTimeToNow } from "@/lib/utils";
import { Comment, CommentVote, User } from "@prisma/client";
import { FC, useRef, useState } from "react";
import UserAvatar from "../user/UserAvatar";
import CommentVoteClient from "./CommentVoteClient";
import { Button } from "../ui/Button";
import { MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Label } from "../ui/Label";
import { Textarea } from "../ui/Textarea";
import { useMutation } from "@tanstack/react-query";
import { CommentRequest } from "@/lib/validators/comment";
import axios from "axios";
import { toast } from "@/hooks/use-toast";

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
  const [isReplying, setIsReplying] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");
  //this ref will close the comment input when clicked outside of it
  const commentRef = useRef<HTMLDivElement>(null);

  const { mutate: replyToComment, isLoading } = useMutation({
    mutationFn: async ({ spillId, text, replyToId }: CommentRequest) => {
      const payload: CommentRequest = {
        spillId,
        text,
        replyToId,
      };
      const { data } = await axios.patch(`/api/company/spill/comment`, payload);
      return data;
    },
    onSuccess: () => {
      router.refresh();
      setInput("");
      setIsReplying(false);
    },
    onError: () => {
      return toast({
        title: "Something went wrong",
        description: "Comment wasn't posted successfully please try again",
        variant: "destructive",
      });
    },
  });

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

      <div className="flex gap-2 items-center flex-wrap">
        <CommentVoteClient
          commentId={comment.commentId || ""}
          initialVotesAmount={votesAmount}
          initialVote={currentVote}
        />
        <Button
          onClick={() => {
            if (!session) return router.push("/sign-in");
            setIsReplying(!isReplying);
          }}
          variant="ghost"
          size="xs"
        >
          <MessageSquare className="h-4 w-4 mr-1.5" />
          Reply
        </Button>
        {isReplying ? (
          <div className="grid w-full gap-1.5">
            {/* <Label htmlFor="comment">Your comment</Label> */}
            <div className="mt-2">
              <Textarea
                id="comment"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={1}
                placeholder="Something to add?"
              />
              <div className="mt-2 flex justify-end gap-2">
                {/* tabindex dictates what happens when you press tab */}
                <Button
                  tabIndex={-1}
                  variant="subtle"
                  onClick={() => setIsReplying(false)}
                >
                  Cancel
                </Button>
                <Button
                  isLoading={isLoading}
                  disabled={input.length === 0}
                  onClick={() => {
                    if (!input) return;
                    replyToComment({
                      spillId,
                      text: input,
                      // replyToId id will be populated by the comment.id which is the topLevelComment.
                      replyToId: comment.replyToId ?? comment.id,
                    });
                  }}
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SpillComment;
