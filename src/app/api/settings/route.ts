import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { UsernameValidator } from "@/lib/validators/username";
import { z } from "zod";

export default async function PUT(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new Response("Unauthorised", { status: 401 });
    }

    //converts the request to json
    const body = await req.json();
    // validated the json and destructures it.
    const { name } = UsernameValidator.parse(body);

    //check if username already exists
    const usernameExists = await db.user.findFirst({
      where: {
        username: name,
      },
    });

    if (usernameExists) {
      return new Response(
        "Username is taken, please try a different username",
        {
          status: 409,
        }
      );
    }

    //update username
    const username = await db.user.update({
      where: {
        id: session.user.id,
      },
      data: { username: name },
    });

    return new Response(username.name);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 });
    }

    return new Response("Could not add company", { status: 500 });
  }
}
