import { notFound } from "next/navigation";

import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config";
import { MiniCreatePost } from "@/components/mini-create-post";
import { PostFeed } from "@/components/post-feed";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

interface SubredditProps {
  params: {
    slug: string;
  };
}

export default async function Subreddit({ params }: SubredditProps) {
  const { slug } = params;

  const session = await getAuthSession();

  const subreddit = await db.subreddit.findFirst({
    where: {
      name: slug,
    },
    include: {
      posts: {
        include: {
          author: true,
          votes: true,
          comments: true,
          subreddit: true,
        },

        orderBy: {
          createdAt: "desc",
        },

        take: INFINITE_SCROLLING_PAGINATION_RESULTS,
      },
    },
  });

  if (!subreddit) return notFound();

  return (
    <>
      <h1 className="h-14 text-3xl font-bold md:text-4xl">
        r/{subreddit.name}
      </h1>
      <MiniCreatePost session={session} />
      <PostFeed initialPosts={subreddit.posts} subredditName={subreddit.name} />
    </>
  );
}
