import MiniCreateSpill from "@/components/spill/MiniCreateSpill";
import SpillFeed from "@/components/spills/SpillFeed";
import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

interface PageProps {
  params: {
    slug: string;
  };
}

const page = async ({ params }: PageProps) => {
  const { slug } = params;
  const session = await getAuthSession();

  const company = await db.company.findFirst({
    where: {
      name: slug,
    },
    include: {
      spills: {
        include: {
          author: true,
          votes: true,
          comments: true,
          company: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        // this adds a limit: (for infinate scroll)
        take: INFINITE_SCROLLING_PAGINATION_RESULTS,
      },
    },
  });

  if (!company) return notFound();

  return (
    <>
      <h1 className="font-bold text-3xl md:text-4xl h-14">{company.name}</h1>
      {company.id}
      <MiniCreateSpill session={session} />
      {/* TODO: Show spills in user feed */}
      <SpillFeed initialSpills={company.spills} companyName={company.name} />
    </>
  );
};

export default page;
