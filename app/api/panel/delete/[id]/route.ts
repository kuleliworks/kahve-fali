import { redis } from "@/lib/redis";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  await redis.zrem("fal:index", id);
  await redis.del(`fal:item:${id}`);
  return new Response(null, { status: 302, headers: { Location: "/panel" } });
}
