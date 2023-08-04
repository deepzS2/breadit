"use client";

import axios, { isAxiosError } from "axios";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { useEffect, useState } from "react";
import { VoteType } from "@prisma/client";
import { usePrevious } from "@mantine/hooks";
import { useMutation } from "@tanstack/react-query";

import { useCustomToast } from "@/hooks/use-custom-toast";
import { cn } from "@/lib/utils";
import { PostVoteRequest } from "@/lib/validators/vote";

import { Button } from "../ui/button";
import { toast } from "@/hooks/use-toast";

interface PostVoteClientProps {
  postId: string;
  initialVotesAmount: number;
  initialVote?: VoteType | null;
}

export const PostVoteClient = ({
  postId,
  initialVote,
  initialVotesAmount,
}: PostVoteClientProps) => {
  const { loginToast } = useCustomToast();
  const [votesAmount, setVotesAmount] = useState(initialVotesAmount);
  const [currentVote, setCurrentVote] = useState(initialVote);
  const previousVote = usePrevious(currentVote);

  useEffect(() => {
    setCurrentVote(initialVote);
  }, [initialVote]);

  const { mutate: vote } = useMutation({
    mutationFn: async (voteType: VoteType) => {
      const payload: PostVoteRequest = {
        voteType,
        postId,
      };

      await axios.patch("/api/subreddit/post/vote", payload);
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
      if (currentVote === type) {
        setCurrentVote(undefined);

        if (type === "UP") setVotesAmount((prev) => prev - 1);
        if (type === "DOWN") setVotesAmount((prev) => prev + 1);
      }

      setCurrentVote(type);

      if (type === "UP") setVotesAmount((prev) => prev + (currentVote ? 2 : 1));
      if (type === "DOWN")
        setVotesAmount((prev) => prev - (currentVote ? 2 : 1));
    },
  });

  return (
    <div className="flex gap-4 pr-6 pb-4 sm:flex-col sm:gap-0 sm:pb-0 sm:w-20">
      <Button
        onClick={() => vote("UP")}
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
            "text-red-500 fill-red-500": currentVote === "DOWN",
          })}
        />
      </Button>
    </div>
  );
};
