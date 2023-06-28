import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { SpillVoteValidator } from "@/lib/validators/vote";

export async function PATCH(req: Request) {
  try {
    //check user is logged in or give an error
    const session = await getAuthSession();
    if (!session?.user) {
      return new Response("Unauthorised", { status: 401 });
    }

    //gets the body from req
    const body = req.json();

    //Type Safe Validation
    const { spillId, voteType } = SpillVoteValidator.parse(body);

    //check if there is a vote there already / find existing vote
    const existingVote = await db.vote.findFirst({
      where: {
        userId: session.user.id,
        spillId,
      },
    });

    //get the spill + spill's author and votes
    const spill = await db.spill.findUnique({
      where: {
        id: spillId,
      },
      include: {
        author: true,
        votes: true,
      },
    });

    // if no spill return error
    if (!spill) {
      return new Response("Spill not found", { status: 404 });
    }

    if (existingVote) {
      if (existingVote.type === voteType) {
        await db.vote.delete({
          where: {
            userId_spillId: {
              spillId,
              userId: session.user.id,
            },
          },
        });
      }
      return new Response("OK");
    }
  } catch (error) {}
}
