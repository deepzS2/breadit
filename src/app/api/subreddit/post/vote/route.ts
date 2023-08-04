import { NextResponse } from "next/server";
import { z } from "zod";

import { PostVoteValidator } from "@/lib/validators/vote";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { CachedPost } from "@/types/redis";
import { redis } from "@/lib/redis";

export const CACHE_AFTER_UPVOTES = 1;

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    const { postId, voteType } = PostVoteValidator.parse(body);

    const session = await getAuthSession();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const existingVote = await db.vote.findFirst({
      where: {
        userId: session.user.id,
        postId,
      },
    });

    const post = await db.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        author: true,
        votes: true,
      },
    });

    if (!post) {
      return new NextResponse("Post not found", { status: 404 });
    }

    if (existingVote) {
      if (existingVote.type === voteType) {
        await db.vote.delete({
          where: {
            userId_postId: { postId, userId: session.user.id },
          },
        });

        return new NextResponse("OK");
      }

      await db.vote.update({
        where: {
          userId_postId: { postId, userId: session.user.id },
        },
        data: {
          type: voteType,
        },
      });

      // Recount the votes
      const votesAmount = post.votes.reduce((acc, vote) => {
        if (vote.type === "UP") return acc + 1;
        if (vote.type === "DOWN") return acc - 1;

        return acc;
      }, 0);

      if (votesAmount >= CACHE_AFTER_UPVOTES) {
        const cachePayload: CachedPost = {
          id: post.id,
          title: post.title,
          content: JSON.stringify(post.content),
          authorUsername: post.author.username ?? "",
          currentVote: voteType,
          createdAt: post.createdAt,
        };

        await redis.hset(`post:${postId}`, cachePayload);
      }

      return new NextResponse("OK");
    }

    await db.vote.create({
      data: {
        type: voteType,
        postId,
        userId: session.user.id,
      },
    });

    // Recount the votes
    const votesAmount = post.votes.reduce((acc, vote) => {
      if (vote.type === "UP") return acc + 1;
      if (vote.type === "DOWN") return acc - 1;

      return acc;
    }, 0);

    if (votesAmount >= CACHE_AFTER_UPVOTES) {
      const cachePayload: CachedPost = {
        id: post.id,
        title: post.title,
        content: JSON.stringify(post.content),
        authorUsername: post.author.username ?? "",
        currentVote: voteType,
        createdAt: post.createdAt,
      };

      await redis.hset(`post:${postId}`, cachePayload);
    }

    return new NextResponse("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data passed", { status: 422 });
    }

    return new NextResponse(
      "Could not register your vote, please try again later.",
      {
        status: 500,
      }
    );
  }
}
