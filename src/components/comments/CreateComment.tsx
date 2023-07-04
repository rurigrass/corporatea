"use client";
import { FC, useState } from "react";
import { Label } from "../ui/Label";
import { Textarea } from "../ui/Textarea";
import { Button } from "../ui/Button";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { CommentRequest } from "@/lib/validators/comment";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface CreateCommentProps {
  spillId: string;
  replyToId?: string
}

const CreateComment: FC<CreateCommentProps> = ({ spillId, replyToId }) => {
  const { loginToast } = useCustomToast();
  const [input, setInput] = useState<string>("");
  const router = useRouter();

  const { mutate: comment, isLoading } = useMutation({
    mutationFn: async ({ spillId, text, replyToId }: CommentRequest) => {
      const payload: CommentRequest = {
        spillId,
        text,
        replyToId,
      };
      const { data } = await axios.patch(`/api/company/spill/comment`, payload);
      return data;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }
      }
      toast({
        title: "There was an error.",
        description: "Could not submit comment.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      router.refresh();
      setInput("");
      return toast({
        title: "Success!",
        description: "Your comment has been submitted",
      });
    },
  });

  return (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="comment">Your comment</Label>
      <div className="mt-2">
        <Textarea
          id="comment"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={1}
          placeholder="Something to add?"
        />
        <div className="mt-2 flex justify-end">
          <Button isLoading={isLoading} disabled={input.length === 0} onClick={()=> comment({spillId, text: input, replyToId})}>
            Post
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateComment;
