import SpillFeed from "./SpillFeed";
import { db } from "@/lib/db";
import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config";

const GeneralFeed = async () => {
  const spills = await db.spill.findMany({
    include: {
      company: true,
      author: true,
      comments: true,
      votes: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: INFINITE_SCROLLING_PAGINATION_RESULTS,
  });

  return <SpillFeed initialSpills={spills} />;
};

export default GeneralFeed;
