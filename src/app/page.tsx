import Link from "next/link";
import { HomeIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { CustomFeed } from "@/components/custom-feed";
import { GeneralFeed } from "@/components/general-feed";
import { getAuthSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function Home() {
  const session = await getAuthSession();

  return (
    <>
      <h1 className="text-3xl font-bold md:text-4xl">Your feed</h1>
      <div className="grid grid-cols-1 gap-y-4 py-6 md:grid-cols-3 md:gap-x-4">
        {/* @ts-expect-error server component */}
        {session ? <CustomFeed /> : <GeneralFeed />}

        {/* Subreddit Info */}
        <div className="overflow-hidden order-first rounded-lg border border-gray-200 md:order-last h-fit">
          <div className="py-4 px-6 bg-emerald-100">
            <p className="flex gap-1.5 items-center py-3 font-semibold">
              <HomeIcon className="w-4 h-4" />
              Home
            </p>
          </div>

          <div className="py-4 px-6 -my-3 text-sm leading-6 divide-y divide-gray-100">
            <div className="flex gap-x-4 justify-between py-3">
              <p className="text-zinc-500">
                Your personal Breadit homepage. Come here to check in with your
                favorite communities.
              </p>
            </div>

            <Link
              className={buttonVariants({ className: "w-full mt-4 mb-6" })}
              href="/r/create"
            >
              Create community
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
