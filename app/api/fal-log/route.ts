import { redis } from "@/lib/redis";

export const runtime = "edge";
export const dynamic = "force-dynamic";

type Body = {
  name?: string;
  age?: number | string;
  gender?: string;
  photosCount?: number | string;
  readingId?: string;   // /fal/[id] için
  notes?: string;       // niyet/mesaj (opsiyonel)
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

    // 1) Kayıt detayını HASH olarak yaz
    await redis.hset(`fal:item:${id}`, item as any);

    // 2) Zaman skoruyla sıralı index'e ekle (yeni → büyük skor)
    await redis.zadd("fal:index", { score: now, member: id });

    // 3) En fazla 1000 kayıt tut (eskiyi temizle)
    const keep = 1000;
    const total = await redis.zcard("fal:index");
    if (total > keep) {
      const toDelete = total - keep;
      // en eski ID'leri al
      const oldIds = await redis.zrange<string[]>("fal:index", 0, toDelete - 1);
      if (oldIds.length) {
        const p = redis.pipeline();
        p.zrem("fal:index", ...oldIds);
        oldIds.forEach((oldId) => p.del(`fal:item:${oldId}`));
        await p.exec();
      }
    }

    // (Opsiyonel) Slack bildirimi — env varsa
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
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: "Kaydedilemedi." }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
