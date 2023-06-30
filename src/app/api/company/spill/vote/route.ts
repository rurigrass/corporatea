import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { SpillVoteValidator } from "@/lib/validators/vote";
import { CachedSpill } from "@/types/redits";
import { z } from "zod";

const CACHE_AFTER_UPVOTES = 1;

export async function PATCH(req: Request) {
  try {
    //check user is logged in or give an error
    const session = await getAuthSession();
    if (!session?.user) {
      return new Response("Unauthorised", { status: 401 });
    }

    //gets the body from req
    const body = req.json();

    //Type Safe Validation - the spillID and whether its up or down
    const { spillId, voteType } = SpillVoteValidator.parse(body);

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

    //check if there is a vote there already / find existing vote
    const existingVote = await db.vote.findFirst({
      where: {
        userId: session.user.id,
        spillId,
      },
    });

    //if existing vote here is the code to delete or change the vote and save to cache
    if (existingVote) {
      //if clicked, unclick it (delete)
      if (existingVote.type === voteType) {
        await db.vote.delete({
          where: {
            userId_spillId: {
              spillId,
              userId: session.user.id,
            },
          },
        });
        return new Response("OK");
      }
      // if clicked is different from what has already been clicked
      await db.vote.update({
        where: {
          userId_spillId: {
            spillId,
            userId: session.user.id,
          },
        },
        data: {
          type: voteType,
        },
      });

      //if interactivity is too high we should cache it / recount the votes
      const votesAmount = spill.votes.reduce((acc, vote) => {
        if (vote.type === "UP") return acc + 1;
        if (vote.type === "DOWN") return acc - 1;
        return acc;
      }, 0);

      if (votesAmount >= CACHE_AFTER_UPVOTES) {
        const cachePayload: CachedSpill = {
          id: spill.id,
          spill: spill.spill,
          authorUsername: spill.author.username ?? "",
          content: JSON.stringify(spill.deets),
          currentVote: voteType,
          createdAt: spill.createdAt,
        };

        //stores it in the cache / serveless upstash+redis
        await redis.hset(`spill:${spillId}`, cachePayload);
      }
      return new Response("OK");
    }

    //if no existing vote adds the vote
    await db.vote.create({
      data: {
        type: voteType,
        userId: session.user.id,
        spillId,
      },
    });

    //THIS IS PASTED FROM ABOVE
    const votesAmount = spill.votes.reduce((acc, vote) => {
      if (vote.type === "UP") return acc + 1;
      if (vote.type === "DOWN") return acc - 1;
      return acc;
    }, 0);
    if (votesAmount >= CACHE_AFTER_UPVOTES) {
      const cachePayload: CachedSpill = {
        id: spill.id,
        spill: spill.spill,
        authorUsername: spill.author.username ?? "",
        content: JSON.stringify(spill.deets),
        currentVote: voteType,
        createdAt: spill.createdAt,
      };
      //stores it in the cache / serveless upstash+redis
      await redis.hset(`spill:${spillId}`, cachePayload);
    }

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
