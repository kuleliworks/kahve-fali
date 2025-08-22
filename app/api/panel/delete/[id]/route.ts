import { redis } from "@/lib/redis";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(_req: Request, ctx: any) {
  const maybe = ctx?.params;
  const params = typeof maybe?.then === "function" ? await maybe : maybe;
  const id = params?.id as string | undefined;

  if (!id) return new Response("Missing id", { status: 400 });

  // 1) Panel listelerinden kaldır
  await redis.zrem("fal:index", id);
  await redis.del(`fal:item:${id}`);

  // 2) Sonuç sayfasını da kapatmak için "engellenenler" setine ekle
  await redis.sadd("fal:blocked:set", id);

  return new Response(null, { status: 302, headers: { Location: "/panel" } });
}
