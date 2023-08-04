import type { Post as PostType, User, Vote } from "@prisma/client";
import { useRef } from "react";
import { MessageSquare } from "lucide-react";

import { formatTimeToNow } from "@/lib/utils";

import { EditorOutput } from "./editor-output";
import { PostVoteClient } from "./post-vote/post-vote-client";

type PartialVote = Pick<Vote, "type">;

interface PostProps {
  subredditName: string;
  post: PostType & {
    author: User;
    votes: Vote[];
  };
  commentAmount: number;
  votesAmount: number;
  currentVote?: PartialVote;
}

export const Post = ({
  subredditName,
  post,
  commentAmount,
  votesAmount,
  currentVote,
}: PostProps) => {
  const postRef = useRef<HTMLDivElement>(null);

  return (
    <div className="bg-white rounded-md shadow">
      <div className="flex justify-between py-4 px-6">
        {/* TODO: PostVotes */}
        <PostVoteClient
          initialVote={currentVote?.type}
          postId={post.id}
          initialVotesAmount={votesAmount}
        />

        <div className="flex-1 w-0">
          <div className="mt-1 max-h-40 text-xs text-gray-500">
            {subredditName ? (
              <>
                <a
                  className="text-sm underline text-zinc-900 underline-offset-2"
                  href={`/r/${subredditName}`}
                >
                  r/{subredditName}
                </a>
                <span className="px-1">•</span>
              </>
            ) : null}
            <span>Posted by u/{post.author.username}</span>{" "}
            {formatTimeToNow(new Date(post.createdAt))}
          </div>

          <a href={`/r/${subredditName}/post/${post.id}`}>
            <h1 className="py-2 text-lg font-semibold leading-6 text-gray-900">
              {post.title}
            </h1>
          </a>

          <div
            className="relative w-full max-h-40 text-sm overflow-clip"
            ref={postRef}
          >
            <EditorOutput content={post.content} />

            {postRef.current?.clientHeight === 160 ? (
              <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent" />
            ) : null}
          </div>
        </div>
      </div>

      <div className="z-20 p-4 text-sm bg-gray-50 sm:px-6">
        <a
          className="flex gap-2 items-center w-fit"
          href={`/r/${subredditName}/post/${post.id}`}
        >
          <MessageSquare className="w-4 h-4" /> {commentAmount} comments
        </a>
      </div>
    </div>
  );
};
