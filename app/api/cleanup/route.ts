import { redis } from "@/lib/redis";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET() {
  const days = Number(process.env.RETENTION_DAYS || 30);
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

  // skor (timestamp) 0..cutoff arası tüm id'leri al
  const oldIds = await redis.zrange<string[]>("fal:index", 0, cutoff, { byScore: true });
  let deleted = 0;

  if (oldIds.length) {
    await redis.zrem("fal:index", ...oldIds);
    const p = redis.pipeline();
    oldIds.forEach((id) => p.del(`fal:item:${id}`));
    await p.exec();
    deleted = oldIds.length;
  }

  return new Response(JSON.stringify({ ok: true, deleted, cutoff }), {
    headers: { "content-type": "application/json" },
  });
}
