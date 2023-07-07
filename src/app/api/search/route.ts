import { db } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const query = url.searchParams.get("q");

  if (!query) return new Response("Invalid Query", { status: 400 });

  const results = await db.company.findMany({
    where: {
      name: {
        startsWith: query,
      },
    },
    include: {
      _count: true,
    },
    take: 5,
  });

  return new Response(JSON.stringify(results));
}
