import { NextResponse } from "next/server";
import { z } from "zod";

import { getAuthSession } from "@/lib/auth";
import { SubredditSubscriptionValidator } from "@/lib/validators/subreddit";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    const { subredditId } = SubredditSubscriptionValidator.parse(body);

    const subscriptionExists = await db.subscription.findFirst({
      where: {
        subredditId,
        userId: session.user.id,
      },
    });

    if (subscriptionExists) {
      return new NextResponse("You are already subscribed to this subreddit", {
        status: 400,
      });
    }

    await db.subscription.create({
      data: {
        subredditId,
        userId: session.user.id,
      },
    });

    return new NextResponse(subredditId);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data passed", { status: 422 });
    }

    return new NextResponse("Could not subscribe, please try again later", {
      status: 500,
    });
  }
}
