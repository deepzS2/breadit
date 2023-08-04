import { notFound } from "next/navigation";

import { Editor } from "@/components/editor";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";

interface SubredditSubmitPageProps {
  params: {
    slug: string;
  };
}

export default async function SubredditSubmitPage({
  params,
}: SubredditSubmitPageProps) {
  const subreddit = await db.subreddit.findFirst({
    where: {
      name: params.slug,
    },
  });

  if (!subreddit) return notFound();

  return (
    <div className="flex flex-col gap-6 items-start">
      <div className="pb-5 border-b border-gray-200">
        <div className="flex flex-wrap items-baseline -mt-2 -ml-2">
          <h3 className="mt-2 ml-2 text-base font-semibold leading-6 text-gray-900">
            Create post
          </h3>
          <p className="mt-1 ml-2 text-sm text-gray-500 truncate">
            in r/{params.slug}
          </p>
        </div>
      </div>

      {/* Form */}
      <Editor subredditId={subreddit.id} />

      <div className="flex justify-end w-full">
        <Button type="submit" className="w-full" form="subreddit-post-form">
          Post
        </Button>
      </div>
    </div>
  );
}
