import { redis } from "@/lib/redis";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(_req: Request, ctx: any) {
  // Next 15'te bazı yerlerde params Promise gelebilir.
  const maybe = ctx?.params;
  const params = typeof maybe?.then === "function" ? await maybe : maybe;
  const id = params?.id as string | undefined;

  if (!id) {
    return new Response("Missing id", { status: 400 });
  }

  await redis.zrem("fal:index", id);
  await redis.del(`fal:item:${id}`);

  return new Response(null, { status: 302, headers: { Location: "/panel" } });
}
