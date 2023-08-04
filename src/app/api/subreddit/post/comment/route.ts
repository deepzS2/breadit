import { NextResponse } from "next/server";
import { z } from "zod";

import { getAuthSession } from "@/lib/auth";
import { CommentValidator } from "@/lib/validators/comment";
import { db } from "@/lib/db";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    const { postId, text, replyToId } = CommentValidator.parse(body);

    const session = await getAuthSession();

    if (!session?.user)
      return new NextResponse("Unauthorized", { status: 401 });

    await db.comment.create({
      data: {
        text,
        postId,
        authorId: session.user.id,
        replyToId,
      },
    });

    return new NextResponse("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data passed", { status: 422 });
    }

    return new NextResponse(
      "Could not create comment, please try again later.",
      {
        status: 500,
      }
    );
  }
}
