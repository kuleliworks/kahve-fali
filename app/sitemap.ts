// app/sitemap.ts
import type { MetadataRoute } from "next";
import { redis } from "@/lib/redis";
import { SITE } from "@/lib/seo";

// Sitemapi düzenli tazeleyelim (5 dk)
export const revalidate = 300;
// İstersen edge de olur ama blog/Redis için node güvenli:
export const runtime = "nodejs";

function safeDate(v?: string) {
  const d = v ? new Date(v) : new Date();
  return isNaN(d.getTime()) ? new Date() : d;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url.replace(/\/$/, "");

  // 1) Statik sayfalar (her zaman gelsin)
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/hakkimizda`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/iletisim`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/gizlilik`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/kvkk`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/kullanim-kosullari`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.6 },
  ];

  // 2) Blog yazıları (Redis hata verirse yalnızca statik döneriz)
  let dynamicPosts: MetadataRoute.Sitemap = [];
  try {
    // blog:index zset → en yeni -> en eski (score = timestamp)
    const raw = (await redis.zrange("blog:index", "+inf", "-inf", {
      byScore: true,
      rev: true,
      limit: { offset: 0, count: 1000 },
    })) as unknown[];

    const slugs = (raw as string[]).filter(Boolean);

    const items = await Promise.all(
      slugs.map(async (slug) => {
        const it = await redis.hgetall<Record<string, string>>(`blog:post:${slug}`);
        if (!it) return null;
        const lm = safeDate(it.updatedAt || it.createdAt);
        return {
          url: `${base}/blog/${encodeURIComponent(slug)}`,
          lastModified: lm,
          changeFrequency: "weekly" as const,
          priority: 0.7,
        };
      })
    );

    dynamicPosts = (items.filter(Boolean) as MetadataRoute.Sitemap);
  } catch {
    // Sessizce statiklerle yetiniriz (sitemap hiç kilitlenmesin)
    dynamicPosts = [];
  }

  return [...staticPages, ...dynamicPosts];
}
