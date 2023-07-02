import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

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

  try {
    
  } catch (error) {
    
  }
}
