import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { CommentValidator } from "@/lib/validators/comment";
import { z } from "zod";

export async function PATCH(req: Request) {
  try {
    //first check if user is logged in
    const session = await getAuthSession();
    if (!session?.user) {
      return new Response("Unauthorised", { status: 401 });
    }

    //converts the request to json
    const body = await req.json();
    //validate body (payload)
    const { spillId, text, replyToId } = CommentValidator.parse(body);

    await db.comment.create({
      data: {
        text,
        spillId,
        authorId: session.user.id,
        replyToId,
      },
    });

    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data passed", { status: 422 });
    }

    return new Response(
      "Could not submit that comment, please try again later",
      {
        status: 500,
      }
    );
  }
}
