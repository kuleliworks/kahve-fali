// app/sitemap.ts
import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";
import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic"; // build'e pinlenmesin; her çağrıda çek

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url;

  // Statik sayfalar
  const items: MetadataRoute.Sitemap = [
    { url: `${base}/`,               lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${base}/hakkimizda`,     lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/iletisim`,       lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/gizlilik`,       lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${base}/kullanim-kosullari`, lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${base}/kvkk`,           lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${base}/blog`,           lastModified: new Date(), changeFrequency: "daily",   priority: 0.6 },
  ];

  try {
    // En yeni -> en eski (score = timestamp). limit istiyorsan slice ile sınırla.
    const slugs = (await redis.zrange("blog:index", 0, -1, { rev: true })) as string[]; 
    const limited = slugs.slice(0, 2000);

    for (const slug of limited) {
      if (!slug) continue;
      const it = await redis.hgetall<Record<string, string>>(`blog:post:${slug}`);
      if (!it || it.status !== "pub") continue;

      const last = new Date(it.updatedAt || it.createdAt || Date.now());
      items.push({
        url: `${base}/blog/${encodeURIComponent(slug)}`,
        lastModified: last,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch {
    // Redis erişimi yoksa statiklerle devam et
  }

  return items;
}
