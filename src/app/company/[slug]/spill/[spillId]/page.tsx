import SpillVoteServer from "@/components/spill-vote/SpillVoteServer";
import EditorOutput from "@/components/spill/EditorOutput";
import { buttonVariants } from "@/components/ui/Button";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { formatTimeToNow } from "@/lib/utils";
import { CachedSpill } from "@/types/redis";
import { Spill, User, Vote } from "@prisma/client";
import { ArrowBigDown, ArrowBigUp, Loader2 } from "lucide-react";
import { notFound } from "next/navigation";
import { Suspense } from "react";

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
        <Suspense fallback={<SpillVoteShell />}>
          {/* @ts-expect-error server component */}
          <SpillVoteServer
            spillId={spill?.id ?? cachedSpill.id}
            getData={async () => {
              return await db.spill.findUnique({
                where: {
                  id: params.spillId,
                },
                include: {
                  votes: true,
                },
              });
            }}
          />
        </Suspense>

        <div className="sm:w-0 w-full flex-1 bg-white p-4 rounded-sm">
          <p className="max-h-40 mt-1 truncate text-xs text-gray-500">
            Tea spilled by{" "}
            {spill?.author.username ?? cachedSpill.authorUsername}{" "}
            {formatTimeToNow(
              new Date(spill?.createdAt ?? cachedSpill.createdAt)
            )}
          </p>
          <h1 className="text-xl font-semibold py-2 leading-6 text-gray-900">
            {spill?.spill ?? cachedSpill.spill}
          </h1>
          <EditorOutput content={spill?.deets ?? cachedSpill.content} />
        </div>
      </div>
    </div>
  );
};

function SpillVoteShell() {
  return (
    <div className="flex items-center flex-col pr-6 w-20">
      {/* upvote */}
      <div className={buttonVariants({ variant: "ghost" })}>
        <ArrowBigUp className="h-5 w-5 text-zinc-500" />
      </div>
      {/* score */}
      <div className="text-center py-2 font-medium text-sm text-zinc-900">
        <Loader2 className=" h-3 w-3 animate-spin" />
      </div>
      {/* downvote */}
      <div className={buttonVariants({ variant: "ghost" })}>
        <ArrowBigDown className="h-5 w-5 text-zinc-500" />
      </div>
    </div>
  );
}

export default page;
