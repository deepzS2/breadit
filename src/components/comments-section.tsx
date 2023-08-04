import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

import { PostComment } from "./post-comment";
import { CreateComment } from "./create-comment";

interface CommentsSectionProps {
  postId: string;
}

export const CommentsSection = async ({ postId }: CommentsSectionProps) => {
  const session = await getAuthSession();
  const comments = await db.comment.findMany({
    where: {
      postId,
      replyToId: null,
    },
    include: {
      author: true,
      votes: true,
      replies: {
        include: {
          author: true,
          votes: true,
        },
      },
    },
  });

  return (
    <div className="flex flex-col gap-y-4 mt-4">
      <hr className="my-6 w-full h-px" />

      <CreateComment postId={postId} />

      <div className="flex flex-col gap-y-6 mt-4">
        {comments
          .filter((comment) => !comment.replyToId)
          .map((topLevelComment) => {
            const topLevelCommentVotesAmount = topLevelComment.votes.reduce(
              (acc, vote) => {
                if (vote.type === "UP") return acc + 1;
                if (vote.type === "DOWN") return acc - 1;

                return acc;
              },
              0
            );

            const topLevelCommentVote = topLevelComment.votes.find(
              (vote) => vote.userId === session?.user.id
            );

            return (
              <div key={topLevelComment.id} className="flex flex-col">
                <div className="mb-2">
                  <PostComment
                    comment={topLevelComment}
                    votesAmount={topLevelCommentVotesAmount}
                    postId={postId}
                    currentVote={topLevelCommentVote}
                  />

                  {/* Render replies */}
                  {topLevelComment.replies
                    .sort((a, b) => b.votes.length - a.votes.length)
                    .map((reply) => {
                      const replyVotesAmount = reply.votes.reduce(
                        (acc, vote) => {
                          if (vote.type === "UP") return acc + 1;
                          if (vote.type === "DOWN") return acc - 1;

                          return acc;
                        },
                        0
                      );

                      const replyVote = reply.votes.find(
                        (vote) => vote.userId === session?.user.id
                      );

                      return (
                        <div
                          key={reply.id}
                          className="py-2 pl-4 ml-2 border-l-2 border-zinc-200"
                        >
                          <PostComment
                            comment={reply}
                            currentVote={replyVote}
                            votesAmount={replyVotesAmount}
                            postId={postId}
                          />
                        </div>
                      );
                    })}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
