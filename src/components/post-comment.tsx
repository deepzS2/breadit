"use client";

import { useRef, useState } from "react";
import { MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { User, Comment, CommentVote } from "@prisma/client";

import { formatTimeToNow } from "@/lib/utils";

import { UserAvatar } from "./user-avatar";
import { CommentVotes } from "./comment-votes";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { CommentRequest } from "@/lib/validators/comment";
import axios from "axios";
import { toast } from "@/hooks/use-toast";

type ExtendedComment = Comment & { author: User; votes: CommentVote[] };

interface PostCommentProps {
  comment: ExtendedComment;
  votesAmount: number;
  currentVote?: CommentVote;
  postId: string;
}

export const PostComment = ({
  comment,
  votesAmount,
  currentVote,
  postId,
}: PostCommentProps) => {
  const router = useRouter();
  const { data: session } = useSession();
  const commentRef = useRef<HTMLDivElement>(null);

  const [input, setInput] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  const { mutate: postComment, isLoading } = useMutation({
    mutationFn: async (payload: CommentRequest) => {
      const { data } = await axios.patch(
        `/api/subreddit/post/comment`,
        payload
      );

      return data;
    },
    onError: () => {
      return toast({
        title: "Something went wrong",
        description: "Comment wasn't posted successfully, please try again.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      router.refresh();
      setIsReplying(false);
    },
  });

  return (
    <div ref={commentRef} className="flex flex-col">
      <div className="flex items-center">
        <UserAvatar
          user={{
            name: comment.author.name || null,
            image: comment.author.image || null,
          }}
          className="w-6 h-6"
        />

        <div className="flex gap-x-2 items-center ml-2">
          <p className="text-sm font-medium text-gray-900">
            u/{comment.author.username}
          </p>
          <p className="max-h-40 text-xs truncate text-zinc-500">
            {formatTimeToNow(new Date(comment.createdAt))}
          </p>
        </div>
      </div>

      <p className="mt-2 text-sm text-zinc-900">{comment.text}</p>

      <div className="flex flex-wrap gap-2 items-center">
        <CommentVotes
          commentId={comment.id}
          initialVotesAmount={votesAmount}
          initialVote={currentVote}
        />

        <Button
          onClick={() => {
            if (!session) return router.push("/sign-in");

            setIsReplying(true);
          }}
          variant="ghost"
          size="xs"
        >
          <MessageSquare className="mr-1.5 w-4 h-4" /> Reply
        </Button>

        {isReplying ? (
          <div className="grid gap-1.5 w-full">
            <Label>Your comment</Label>

            <div className="mt-2">
              <Textarea
                id="comment"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={1}
                placeholder="What are your thoughts?"
              />

              <div className="flex gap-2 justify-end mt-2">
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
                  onClick={() =>
                    postComment({
                      postId,
                      text: input,
                      replyToId: comment.replyToId ?? comment.id,
                    })
                  }
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
