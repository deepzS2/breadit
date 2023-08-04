"use client";

import axios, { isAxiosError } from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CreateSubredditPayload } from "@/lib/validators/subreddit";
import { toast } from "@/hooks/use-toast";
import { useCustomToast } from "@/hooks/use-custom-toast";

export default function CreateSubreddit() {
  const { loginToast } = useCustomToast();
  const router = useRouter();
  const [input, setInput] = useState("");

  const { mutate: createCommunity, isLoading } = useMutation({
    mutationFn: async () => {
      const payload: CreateSubredditPayload = {
        name: input,
      };

      const { data } = await axios.post("/api/subreddit", payload);

      return data as string;
    },
    onError: (err) => {
      if (isAxiosError(err)) {
        if (err.response?.status === 409) {
          return toast({
            title: "Subreddit already exists",
            description: "Please choose a different subreddit name",
            variant: "destructive",
          });
        }

        if (err.response?.status === 422) {
          return toast({
            title: "Invalid subreddit name.",
            description: "Please choose a name between 3 and 21 characters",
            variant: "destructive",
          });
        }

        if (err.response?.status === 401) {
          return loginToast();
        }
      }

      toast({
        title: "There was an error",
        description: "Could not create subreddit",
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      router.push(`/r/${data}`);
    },
  });

  return (
    <div className="container flex items-center mx-auto max-w-3xl h-full">
      <div className="relative p-4 space-y-6 w-full bg-white rounded-lg h-fit">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Create a community</h1>
        </div>

        <hr className="h-px bg-zinc-500" />

        <div>
          <p className="text-lg font-medium">Name</p>
          <p className="pb-2 text-xs">
            Community names including capitalization cannot be changed.
          </p>

          <div className="relative">
            <p className="grid absolute inset-y-0 left-0 place-items-center w-8 text-sm text-zinc-400">
              r/
            </p>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="pl-6"
            />
          </div>
        </div>

        <div className="flex gap-4 justify-end">
          <Button variant="subtle" onClick={router.back}>
            Cancel
          </Button>
          <Button
            isLoading={isLoading}
            disabled={input.length === 0 || isLoading}
            onClick={() => createCommunity()}
          >
            Create Community
          </Button>
        </div>
      </div>
    </div>
  );
}
