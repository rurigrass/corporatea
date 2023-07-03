import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { CachedSpill } from "@/types/redis";
import { Spill, User, Vote } from "@prisma/client";
import { notFound } from "next/navigation";

interface pageProps {
  params: {
    spillId: string;
  };
}

//hard reload everything
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-stor";

const page = async ({ params }: pageProps) => {
  const { spillId } = params;

  //faster performance to fetch from cache
  const cachedSpill = (await redis.hgetall(`spill:${spillId}`)) as CachedSpill;
  let spill: (Spill & { votes: Vote[]; author: User }) | null = null;

  //if not in cache fetch normally
  if (!cachedSpill) {
    spill = await db.spill.findFirst({
      where: {
        id: spillId,
      },
      include: {
        author: true,
        // company: true,
        // comments: true,
        votes: true,
      },
    });
  }

  //404
  if (!spill && !cachedSpill) return notFound();

  console.log(spill);

  return (
    <div>
      <div className="h-full flex flex-col sm:flex-row items-center sm:items-start justify-between">
        
      </div>
    </div>
  );
};

export default page;
