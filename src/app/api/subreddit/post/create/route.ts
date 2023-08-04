import { NextResponse } from "next/server";
import { z } from "zod";

import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { PostValidator } from "@/lib/validators/post";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    const { title, content, subredditId } = PostValidator.parse(body);

    const subscriptionExists = await db.subscription.findFirst({
      where: {
        subredditId,
        userId: session.user.id,
      },
    });

    if (!subscriptionExists) {
      return new NextResponse("Subscribe to post", {
        status: 400,
      });
    }

    await db.post.create({
      data: {
        subredditId,
        title,
        content,
        authorId: session.user.id,
      },
    });

    return new NextResponse("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data passed", { status: 422 });
    }

    return new NextResponse(
      "Could not post to subreddit at this time, please try again later.",
      {
        status: 500,
      }
    );
  }
}
