import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowBigDown, ArrowBigUp, Loader2 } from "lucide-react";
import { Post, User, Vote } from "@prisma/client";

import { buttonVariants } from "@/components/ui/button";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { CachedPost } from "@/types/redis";
import { PostVoteServer } from "@/components/post-vote/post-vote-server";
import { formatTimeToNow } from "@/lib/utils";
import { EditorOutput } from "@/components/editor-output";
import { CommentsSection } from "@/components/comments-section";

interface SubredditPostPageProps {
  params: {
    postId: string;
  };
}

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function SubredditPostPage({
  params,
}: SubredditPostPageProps) {
  const cachedPost = (await redis.hgetall(
    `post:${params.postId}`
  )) as CachedPost;

  let post: (Post & { votes: Vote[]; author: User }) | null = null;

  if (!cachedPost) {
    post = await db.post.findFirst({
      where: {
        id: params.postId,
      },
      include: {
        votes: true,
        author: true,
      },
    });
  }

  if (!post && !cachedPost) return notFound();

  return (
    <div>
      <div className="flex flex-col justify-between items-center h-full sm:flex-row sm:items-start">
        <Suspense fallback={<PostVoteShell />}>
          {/* @ts-expect-error server component */}
          <PostVoteServer
            postId={post?.id ?? cachedPost.id}
            getData={async () => {
              return await db.post.findUnique({
                where: {
                  id: params.postId,
                },
                include: {
                  votes: true,
                },
              });
            }}
          />
        </Suspense>

        <div className="flex-1 p-4 w-full bg-white rounded-sm sm:w-0">
          <p className="mt-1 max-h-40 text-xs text-gray-500 truncate">
            Posted by u/{post?.author.username ?? cachedPost.authorUsername}{" "}
            {formatTimeToNow(new Date(post?.createdAt ?? cachedPost.createdAt))}
          </p>
          <h1 className="py-2 text-xl font-semibold leading-6 text-gray-900">
            {post?.title ?? cachedPost.title}
          </h1>

          <EditorOutput content={post?.content ?? cachedPost.content} />

          <Suspense
            fallback={
              <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
            }
          >
            {/* @ts-expect-error server component */}
            <CommentsSection postId={post?.id ?? cachedPost.id} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function PostVoteShell() {
  return (
    <div className="flex flex-col items-center pr-6 w-20">
      {/* Upvote */}
      <div className={buttonVariants({ variant: "ghost" })}>
        <ArrowBigUp className="w-5 h-5 text-zinc-700" />
      </div>

      {/* Score */}
      <div className="py-2 text-sm font-medium text-center text-zinc-900">
        <Loader2 className="w-3 h-3 animate-spin" />
      </div>

      {/* Downvote */}
      <div className={buttonVariants({ variant: "ghost" })}>
        <ArrowBigDown className="w-5 h-5 text-zinc-700" />
      </div>
    </div>
  );
}
