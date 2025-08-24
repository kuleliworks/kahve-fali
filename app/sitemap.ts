// app/sitemap.ts
import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";
import { redis } from "@/lib/redis";

// Sitemap'i 5 dakikada bir yenile (ISR)
export const revalidate = 300;
// Tamamen SSG + ISR çalışsın
export const dynamic = "force-static";

type BlogUrl = { url: string; lastModified: Date };

async function getBlogUrls(): Promise<BlogUrl[]> {
  try {
    // Tip güvenli: options kullanmadan al, sonra JS'te ters çevir
    const raw = (await redis.zrange("blog:index", 0, -1)) as unknown as string[];
    const slugs = Array.isArray(raw) ? [...raw].reverse() : [];

    const rows = await Promise.all(
      slugs.map(async (slug) => {
        const it = await redis.hgetall<Record<string, string>>(`blog:post:${slug}`);
        if (!it) return null;

        const lm = it.updatedAt || it.createdAt || new Date().toISOString();
        return {
          url: `${SITE.url.replace(/\/$/, "")}/blog/${encodeURIComponent(slug)}`,
          lastModified: new Date(lm),
        } as BlogUrl;
      })
    );

    return rows.filter(Boolean) as BlogUrl[];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url.replace(/\/$/, "");
  const now = new Date();

  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${base}/`,                lastModified: now, changeFrequency: "daily",   priority: 1 },
    { url: `${base}/hakkimizda`,      lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/iletisim`,        lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${base}/gizlilik`,        lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${base}/kvkk`,            lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${base}/kullanim-kosullari`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/blog`,            lastModified: now, changeFrequency: "daily",   priority: 0.8 },
  ];

  const blogUrls = await getBlogUrls();

  const blogEntries: MetadataRoute.Sitemap = blogUrls.map((b) => ({
    url: b.url,
    lastModified: b.lastModified,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticUrls, ...blogEntries];
}
