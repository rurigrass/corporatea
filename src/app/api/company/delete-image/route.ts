import { ImageValidator } from "@/lib/validators/image";
import { utapi } from "uploadthing/server";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fileKey, fileUrl } = ImageValidator.parse(body);

    //delete from uploadthing
    await utapi.deleteFiles(fileKey);
    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data passed", { status: 422 });
    }

    return new Response(
      "Could not delete image at this time, please try again later",
      {
        status: 500,
      }
    );
  }
}
