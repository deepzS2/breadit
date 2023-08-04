import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { Post, Vote, VoteType } from "@prisma/client";

import { PostVoteClient } from "./post-vote-client";

interface PostVoteServerProps {
  postId: string;
  initialVotesAmount?: number;
  initialVote: VoteType | null;
  getData?: () => Promise<(Post & { votes: Vote[] }) | null>;
}

export const PostVoteServer = async ({
  getData,
  initialVote,
  initialVotesAmount,
  postId,
}: PostVoteServerProps) => {
  const session = await getServerSession();

  let votesAmount = 0;
  let currentVote: VoteType | null | undefined = undefined;

  if (getData) {
    const post = await getData();

    if (!post) return notFound();

    votesAmount = post.votes.reduce((acc, vote) => {
      if (vote.type === "UP") return acc + 1;
      if (vote.type === "DOWN") return acc - 1;

      return acc;
    }, 0);

    currentVote = post.votes.find(
      (vote) => vote.userId === session?.user.id
    )?.type;
  } else {
    votesAmount = initialVotesAmount!;
    currentVote = initialVote;
  }

  return (
    <PostVoteClient
      postId={postId}
      initialVotesAmount={votesAmount}
      initialVote={currentVote}
    />
  );
};
