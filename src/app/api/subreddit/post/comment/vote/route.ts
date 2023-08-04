import { NextResponse } from "next/server";
import { z } from "zod";

import { CommentVoteValidator } from "@/lib/validators/vote";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    const { commentId, voteType } = CommentVoteValidator.parse(body);

    const session = await getAuthSession();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const existingVote = await db.commentVote.findFirst({
      where: {
        userId: session.user.id,
        commentId,
      },
    });

    if (existingVote) {
      if (existingVote.type === voteType) {
        await db.commentVote.delete({
          where: {
            userId_commentId: { commentId, userId: session.user.id },
          },
        });

        return new NextResponse("OK");
      }

      await db.commentVote.update({
        where: {
          userId_commentId: { commentId, userId: session.user.id },
        },
        data: {
          type: voteType,
        },
      });

      return new NextResponse("OK");
    }

    await db.commentVote.create({
      data: {
        type: voteType,
        commentId,
        userId: session.user.id,
      },
    });

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
