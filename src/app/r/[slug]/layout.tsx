import { SubscribeLeaveToggle } from "@/components/subscribe-leave-toggle";
import { buttonVariants } from "@/components/ui/button";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { format } from "date-fns";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function SubredditLayout({
  children,
  params: { slug },
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
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
        },
      },
    },
  });

  const subscription = !session?.user
    ? undefined
    : await db.subscription.findFirst({
        where: {
          subreddit: {
            name: slug,
          },
          user: {
            id: session.user.id,
          },
        },
      });

  const isSubscribed = Boolean(subscription);

  if (!subreddit) return notFound();

  const memberCount = await db.subscription.count({
    where: {
      subredditId: subreddit.id,
    },
  });

  return (
    <div className="pt-12 mx-auto max-w-7xl h-full sm:container">
      <div>
        {/* TODO: Button to take us back */}
        <div className="grid grid-cols-1 gap-y-4 py-6 md:grid-cols-3 md:gap-x-4">
          <div className="flex flex-col col-span-2 space-y-6">{children}</div>

          {/* Info sidebar */}
          <div className="hidden overflow-hidden order-first rounded-lg border border-gray-200 md:block md:order-last h-fit">
            <div className="py-4 px-6">
              <p className="py-3 font-semibold">About r/{subreddit.name}</p>
            </div>

            <dl className="py-4 px-6 text-sm leading-6 bg-white divide-y divide-gray-100">
              <div className="flex gap-x-4 justify-between py-3">
                <dt className="text-gray-500">Created</dt>
                <dd className="text-gray-700">
                  <time dateTime={subreddit.createdAt.toDateString()}>
                    {format(subreddit.createdAt, "MMMM d, yyyy")}
                  </time>
                </dd>
              </div>

              <div className="flex gap-x-4 justify-between py-3">
                <dt className="text-gray-500">Members</dt>
                <dd className="text-gray-700">
                  <div className="text-gray-900">{memberCount}</div>
                </dd>
              </div>

              {subreddit.creatorId === session?.user.id ? (
                <div className="flex gap-x-4 justify-between py-3">
                  <p className="text-gray-500">You created this community</p>
                </div>
              ) : null}

              {subreddit.creatorId !== session?.user.id ? (
                <SubscribeLeaveToggle
                  isSubscribed={isSubscribed}
                  subredditId={subreddit.id}
                  subredditName={subreddit.name}
                />
              ) : null}

              <Link
                href={`r/${slug}/submit`}
                className={buttonVariants({
                  variant: "outline",
                  className: "w-full mb-6",
                })}
              >
                Create post
              </Link>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
