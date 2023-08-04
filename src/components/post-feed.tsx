"use client";

import axios from "axios";
import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useIntersection } from "@mantine/hooks";

import { ExtendedPost } from "@/types/db";
import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config";
import { Post } from "./post";

interface PostFeedProps {
  initialPosts: ExtendedPost[];
  subredditName?: string;
}

export const PostFeed = ({ initialPosts, subredditName }: PostFeedProps) => {
  const lastPostRef = useRef<HTMLElement>();
  const { ref: intersectionRef, entry } = useIntersection({
    root: lastPostRef.current,
    threshold: 1,
  });

  const { data: session } = useSession();

  const { data, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["infinite-query"],
    queryFn: async ({ pageParam = 1 }) => {
      const query =
        `/api/posts?limit=${INFINITE_SCROLLING_PAGINATION_RESULTS}&page=${pageParam}` +
        (Boolean(subredditName) ? `$subredditName=${subredditName}` : "");

      const { data } = await axios.get(query);

      return data as ExtendedPost[];
    },
    getNextPageParam: (_, pages) => {
      return pages.length + 1;
    },
    initialData: { pages: [initialPosts], pageParams: [1] },
  });

  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage();
    }
  }, [entry, fetchNextPage]);

  const posts = data?.pages.flatMap((page) => page) ?? initialPosts;

  return (
    <ul className="flex flex-col col-span-2 space-y-6">
      {posts.map((post, index) => {
        const votesAmount = post.votes.reduce((acc, vote) => {
          if (vote.type === "UP") return acc + 1;
          if (vote.type === "DOWN") return acc - 1;

          return acc;
        }, 0);

        const currentVote = post.votes.find(
          (vote) => vote.userId === session?.user.id
        );

        if (index === posts.length - 1) {
          return (
            <li key={post.id} ref={intersectionRef}>
              <Post
                commentAmount={post.comments.length}
                post={post}
                subredditName={post.subreddit.name}
                currentVote={currentVote}
                votesAmount={votesAmount}
              />
            </li>
          );
        } else {
          return (
            <Post
              key={post.id}
              post={post}
              subredditName={post.subreddit.name}
              commentAmount={post.comments.length}
              currentVote={currentVote}
              votesAmount={votesAmount}
            />
          );
        }
      })}
    </ul>
  );
};
