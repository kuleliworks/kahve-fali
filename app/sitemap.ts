import { redis } from "@/lib/redis";
import { SITE } from "@/lib/seo";
import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url.replace(/\/+$/, "");

  // Statik sayfalar
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${base}/hakkimizda`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/iletisim`,   lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/gizlilik`,   lastModified: new Date(), changeFrequency: "yearly",  priority: 0.4 },
    { url: `${base}/kullanim-kosullari`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/kvkk`,       lastModified: new Date(), changeFrequency: "yearly",  priority: 0.4 },
    { url: `${base}/blog`,       lastModified: new Date(), changeFrequency: "daily",   priority: 0.7 },
  ];

  // Blog yazıları (yayında olanlar)
  const slugs = (await redis.zrange("blog:index", "+inf" as any, "-inf", {
    byScore: true,
    rev: true,
    offset: 0,
    count: 200, // isteğe göre
  })) as string[];

  const posts: MetadataRoute.Sitemap = [];
  for (const slug of slugs) {
    const it = await redis.hgetall<Record<string, string>>(`blog:post:${slug}`);
    if (!it || Object.keys(it).length === 0) continue;
    if (it.status && it.status !== "pub") continue;
    const lm = it.updatedAt || it.createdAt;
    posts.push({
      url: `${base}/blog/${slug}`,
      lastModified: lm ? new Date(Number(lm)) : new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  // NOT: /fal/* sonuçlarını sitemap’e eklemiyoruz (robots.txt zaten disallow ediyor)
  return [...staticRoutes, ...posts];
}
