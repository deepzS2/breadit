"use client";

import axios, { isAxiosError } from "axios";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { useEffect, useState } from "react";
import { CommentVote, VoteType } from "@prisma/client";
import { usePrevious } from "@mantine/hooks";
import { useMutation } from "@tanstack/react-query";

import { toast } from "@/hooks/use-toast";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { cn } from "@/lib/utils";
import { CommentVoteRequest } from "@/lib/validators/vote";

import { Button } from "./ui/button";

interface CommentVotesProps {
  commentId: string;
  initialVotesAmount: number;
  initialVote?: Pick<CommentVote, "type">;
}

export const CommentVotes = ({
  commentId,
  initialVote,
  initialVotesAmount,
}: CommentVotesProps) => {
  const { loginToast } = useCustomToast();
  const [votesAmount, setVotesAmount] = useState(initialVotesAmount);
  const [currentVote, setCurrentVote] = useState(initialVote);
  const previousVote = usePrevious(currentVote);

  useEffect(() => {
    setCurrentVote(initialVote);
  }, [initialVote]);

  const { mutate: vote } = useMutation({
    mutationFn: async (voteType: VoteType) => {
      const payload: CommentVoteRequest = {
        voteType,
        commentId,
      };

      await axios.patch("/api/subreddit/post/comment/vote", payload);
    },
    onError: (err, voteType) => {
      if (voteType === "UP") setVotesAmount((prev) => prev - 1);
      else setVotesAmount((prev) => prev + 1);

      setCurrentVote(previousVote);

      if (isAxiosError(err)) {
        if (err.response?.status === 401) {
          return loginToast();
        }
      }

      return toast({
        title: "Something went wrong",
        description: "Your vote was not registered, please try again.",
        variant: "destructive",
      });
    },
    onMutate: (type) => {
      if (currentVote?.type === type) {
        setCurrentVote(undefined);

        if (type === "UP") setVotesAmount((prev) => prev - 1);
        if (type === "DOWN") setVotesAmount((prev) => prev + 1);
      }

      setCurrentVote({ type });

      if (type === "UP") setVotesAmount((prev) => prev + (currentVote ? 2 : 1));
      if (type === "DOWN")
        setVotesAmount((prev) => prev - (currentVote ? 2 : 1));
    },
  });

  return (
    <div className="flex gap-1">
      <Button
        onClick={() => vote("UP")}
        size="sm"
        variant="ghost"
        aria-label="upvote"
      >
        <ArrowBigUp
          className={cn("h-5 w-5 text-zinc-700", {
            "text-emerald-500 fill-emerald-500": currentVote?.type === "UP",
          })}
        />
      </Button>

      <p className="py-2 text-sm font-medium text-center text-zinc-900">
        {votesAmount}
      </p>

      <Button
        onClick={() => vote("DOWN")}
        size="sm"
        variant="ghost"
        aria-label="upvote"
      >
        <ArrowBigDown
          className={cn("h-5 w-5 text-zinc-700", {
            "text-red-500 fill-red-500": currentVote?.type === "DOWN",
          })}
        />
      </Button>
    </div>
  );
};
