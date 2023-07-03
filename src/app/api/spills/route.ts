import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export async function GET(req: Request) {
  //this is for us to get more info from the url
  const url = new URL(req.url);

  const session = await getAuthSession();

  //check if member is logged in and save all their subscriptions into array
  let followedCompanyIds: String[] = [];
  if (session) {
    const followedCompanies = await db.follower.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        company: true,
      },
    });
    followedCompanyIds = followedCompanies.map(({ company }) => company.id);
  }

  //
  try {
    //this gets all the search params, zod makes it typesafe
    const { limit, page, companyName } = z
      .object({
        limit: z.string(),
        page: z.string(),
        companyName: z.string().nullish().optional(),
      })
      .parse({
        limit: url.searchParams.get("limit"),
        page: url.searchParams.get("page"),
        companyName: url.searchParams.get("companyName"),
      });

    //define prisma whereclauses: 1 for company feed, 1 for user following feed and, 1 general feed
    let whereClause = {};
    if (companyName) {
      whereClause = {
        company: {
          name: companyName,
        },
      };
    } else if (session) {
      whereClause = {
        company: {
          id: {
            in: followedCompanyIds,
          },
        },
      };
    }

    const spills = await db.spill.findMany({
      //parseInt will turn the string into a number
      take: parseInt(limit),
      //where to start taking spills from the array
      skip: (parseInt(page) - 1) * parseInt(limit),
      orderBy: {
        createdAt: "desc",
      },
      include: {
        company: true,
        author: true,
        votes: true,
        comments: true,
      },
      where: whereClause,
    });

    return new Response(JSON.stringify(spills));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data passed", { status: 422 });
    }

    return new Response("Could not fetch more spills, please try again later", {
      status: 500,
    });
  }
}
