"use server";

import { redis } from "@/lib/redis";
// (İstersen @vercel/blob'dan del import edip görselleri de silebilirsin)
// import { del } from "@vercel/blob";

export async function deletePosts(slugs: string[]) {
  if (!Array.isArray(slugs) || slugs.length === 0) return { ok: true };

  for (const slug of slugs) {
    // Kaydı oku (istersen görsel URL'ini de toplayıp blob'dan sil)
    // const it = await redis.hgetall<Record<string, string>>(`blog:post:${slug}`);
    await redis.del(`blog:post:${slug}`);
    await redis.zrem("blog:index", slug);

    // Eğer blob dosyasını da kaldırmak istersen:
    // const img = it?.image;
    // if (img?.includes(".vercel-storage.com/")) await del(img);
  }

  return { ok: true, count: slugs.length };
}
