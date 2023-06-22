import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { CompanyFollowerValidator } from "@/lib/validators/company";
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
    const { companyId } = CompanyFollowerValidator.parse(body);

    //check if company is already followed
    const companyIsFollowed = await db.follower.findFirst({
      where: {
        companyId,
        userId: session?.user.id,
      },
    });

    if (companyIsFollowed) {
      return new Response("You already follow this Company", { status: 400 });
    }

    // create subreddit and associate it with the user
    await db.follower.create({
      data: {
        companyId,
        userId: session?.user.id,
      },
    });

    return new Response(companyId);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data passed", { status: 422 });
    }

    return new Response(
      "Could not follow company at this time, please try again later",
      {
        status: 500,
      }
    );
  }
}
