import { redis } from "@/lib/redis";

export const runtime = "edge";
export const dynamic = "force-dynamic";

type Body = {
  name?: string;
  age?: number | string;
  gender?: string;
  photosCount?: number | string;
  readingId?: string;
  notes?: string;
};

export async function POST(req: Request) {
  try {
    const data = (await req.json()) as Body;

    const now = Date.now();
    const id = (data.readingId || crypto.randomUUID()).toString();

    const item = {
      id,
      name: (data.name || "").toString().trim(),
      age: (data.age || "").toString().trim(),
      gender: (data.gender || "").toString().trim(),
      photosCount: Number(data.photosCount || 0),
      notes: (data.notes || "").toString().trim(),
      createdAt: now,
    };

    // HASH yaz
    await redis.hset(`fal:item:${id}`, item as Record<string, any>);

    // ZSET'e ekle
    await redis.zadd("fal:index", { score: now, member: id });

    // En fazla 1000 kayıt tut
    const total = await redis.zcard("fal:index");
    const keep = 1000;
    if (total > keep) {
      const toDelete = total - keep;
      const oldUnknown = await redis.zrange("fal:index", 0, toDelete - 1); // en eski
      const oldIds: string[] = (Array.isArray(oldUnknown) ? oldUnknown : []).map((v) => String(v));
      if (oldIds.length) {
        const p = redis.pipeline();
        p.zrem("fal:index", ...oldIds);
        oldIds.forEach((oid) => p.del(`fal:item:${oid}`));
        await p.exec();
      }
    }

    // Opsiyonel Slack
    const webhook = process.env.SLACK_WEBHOOK_URL;
    if (webhook) {
      const base = process.env.SITE_URL || "https://kahvefalin.com";
      const url = `${base}/fal/${encodeURIComponent(id)}`;
      const text =
        `Yeni fal: *${item.name || "-"}* • ${item.age || "-"} / ${item.gender || "-"} ` +
        `• foto:${item.photosCount} • ${url}`;
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "content-type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Kaydedilemedi." }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
