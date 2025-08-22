import { redis } from "@/lib/redis";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET() {
  const days = Number(process.env.RETENTION_DAYS || 90);
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

  // Skora göre 0..cutoff arası id'ler (en eski)
  const idsUnknown = await redis.zrange("fal:index", 0, cutoff, { byScore: true });
  const oldIds: string[] = (Array.isArray(idsUnknown) ? idsUnknown : []).map((v) => String(v));

  let deleted = 0;
  if (oldIds.length) {
    const p = redis.pipeline();
    p.zrem("fal:index", ...oldIds);
    oldIds.forEach((id) => p.del(`fal:item:${id}`));
    await p.exec();
    deleted = oldIds.length;
  }

  return new Response(JSON.stringify({ ok: true, deleted, cutoff }), {
    headers: { "content-type": "application/json" },
  });
}
