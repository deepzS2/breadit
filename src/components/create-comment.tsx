"use client";

import axios, { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { toast } from "@/hooks/use-toast";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { CommentRequest } from "@/lib/validators/comment";

import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";

interface CreateCommentProps {
  postId: string;
  replyToId?: string;
}

export const CreateComment = ({ postId, replyToId }: CreateCommentProps) => {
  const [input, setInput] = useState("");

  const router = useRouter();
  const { loginToast } = useCustomToast();

  const { mutate: comment, isLoading } = useMutation({
    mutationFn: async (payload: CommentRequest) => {
      const { data } = await axios.patch(
        `/api/subreddit/post/comment`,
        payload
      );

      return data;
    },
    onError: (err) => {
      if (isAxiosError(err)) {
        if (err.response?.status === 401) {
          return loginToast();
        }
      }

      return toast({
        title: "There was a problem",
        description: "Something went wrong, please try again.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      router.refresh();
      setInput("");
    },
  });

  return (
    <div className="grid gap-1.5 w-full">
      <Label htmlFor="comment">Your comment</Label>
      <div className="mt-2">
        <Textarea
          id="comment"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={1}
          placeholder="What are your thoughts?"
        />

        <div className="flex justify-end mt-2">
          <Button
            isLoading={isLoading}
            disabled={input.length === 0}
            onClick={() => comment({ postId, text: input, replyToId })}
          >
            Post
          </Button>
        </div>
      </div>
    </div>
  );
};
