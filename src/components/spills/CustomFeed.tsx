import SpillFeed from "./SpillFeed";
import { db } from "@/lib/db";
import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config";
import { getAuthSession } from "@/lib/auth";

const CustomFeed = async () => {
  const session = await getAuthSession();

  const followedCompanies = await db.follower.findMany({
    where: {
      userId: session?.user.id,
    },
    include: {
      company: true,
    },
  });

  const spills = await db.spill.findMany({
    where: {
      company: {
        name: {
          in: followedCompanies.map((followed) => followed.company.name),
        },
      },
    },
    include: {
      author: true,
      comments: true,
      company: true,
      votes: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: INFINITE_SCROLLING_PAGINATION_RESULTS,
  });

  return <SpillFeed initialSpills={spills} />;
};

export default CustomFeed;
