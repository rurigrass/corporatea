import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { UsernameValidator } from "@/lib/validators/username";
import { z } from "zod";

export async function PATCH(req: Request) {
  console.log("THE REQUEST ", req);

  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new Response("Unauthorised", { status: 401 });
    }

    //converts the request to json
    const body = await req.json();
    // validated the json and destructures it.
    const { name } = UsernameValidator.parse(body);
    console.log(name);

    //check if username already exists - also let  user update username to same username
    if (session.user.username !== name) {
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
    }

    //update username
    await db.user.update({
      where: {
        id: session.user.id,
      },
      data: { username: name },
    });

    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 });
    }

    return new Response("Could not update username", { status: 500 });
  }
}
