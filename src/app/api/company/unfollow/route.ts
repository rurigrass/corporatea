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

    if (!companyIsFollowed) {
      return new Response("You do not follow this Company", { status: 400 });
    }

    //check if user is the creator of the company
    const userIsCompanyCreator = await db.company.findFirst({
      where: {
        id: companyId,
        creatorId: session.user.id,
      },
    });

    if (userIsCompanyCreator) {
      return new Response("You cant unfollow a company you created", {
        status: 400,
      });
    }

    await db.follower.delete({
      where: {
        userId_companyId: {
          companyId,
          userId: session?.user.id,
        },
      },
    });

    return new Response(companyId);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data passed", { status: 422 });
    }

    return new Response(
      "Could not unfollow company at this time, please try again later",
      {
        status: 500,
      }
    );
  }
}
