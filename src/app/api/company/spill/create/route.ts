import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { SpillValidator } from "@/lib/validators/spill";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new Response("Unauthorised", { status: 401 });
    }

    //converts the request to json
    const body = await req.json();
    //validate body
    const { companyId, spill, deets } = SpillValidator.parse(body);

    //check if company is already followed
    const companyIsFollowed = await db.follower.findFirst({
      where: {
        userId: session?.user.id,
        companyId,
      },
    });

    if (!companyIsFollowed) {
      return new Response("You must follow the company to spill", {
        status: 400,
      });
    }

    // create subreddit and associate it with the user
    await db.spill.create({
      data: {
        spill,
        deets,
        authorId: session.user.id,
        companyId,
      },
    });

    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data passed", { status: 422 });
    }

    return new Response("Could not spill that tea, please try again later", {
      status: 500,
    });
  }
}
