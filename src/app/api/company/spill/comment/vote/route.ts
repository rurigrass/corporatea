import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { CommentVoteValidator } from "@/lib/validators/vote";
import { z } from "zod";

export async function PATCH(req: Request) {
  try {
    //check user is logged in or give an error
    const session = await getAuthSession();
    if (!session?.user) {
      return new Response("Unauthorised", { status: 401 });
    }

    //gets the body from req
    const body = await req.json();

    //Type Safe Validation - the spillID and whether its up or down
    const { commentId, voteType } = CommentVoteValidator.parse(body);

    //check if there is a vote there already / find existing vote
    const existingVote = await db.commentVote.findFirst({
      where: {
        userId: session.user.id,
        commentId,
      },
    });

    //if existing vote here is the code to delete or change the vote and save to cache
    if (existingVote) {
      //if clicked, unclick it (delete)
      if (existingVote.type === voteType) {
        await db.commentVote.delete({
          where: {
            userId_commentId: {
              commentId,
              userId: session.user.id,
            },
          },
        });

        return new Response("OK");
      } else {
        // if clicked is different from what has already been clicked
        await db.commentVote.update({
          where: {
            userId_commentId: {
              commentId,
              userId: session.user.id,
            },
          },
          data: {
            type: voteType,
          },
        });
        return new Response("OK");
      }
    }

    //if no existing vote adds the vote
    await db.commentVote.create({
      data: {
        type: voteType,
        userId: session.user.id,
        commentId,
      },
    });

    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data passed", { status: 422 });
    }

    return new Response(
      "Could not register your vote, please try again later",
      {
        status: 500,
      }
    );
  }
}
