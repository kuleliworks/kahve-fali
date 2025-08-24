// app/sitemap.ts — DİNAMİK (blog yazılarını otomatik ekler)
import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";
import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url.replace(/\/$/, "");
  const now = new Date();

  // Statik sayfalar
  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${base}/`,                   lastModified: now, changeFrequency: "daily",   priority: 1 },
    { url: `${base}/hakkimizda`,         lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/iletisim`,           lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${base}/gizlilik`,           lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${base}/kvkk`,               lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${base}/kullanim-kosullari`, lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${base}/blog`,               lastModified: now, changeFrequency: "daily",   priority: 0.8 },
  ];

  // Blog yazıları
  let slugs: string[] = [];
  try {
    // Generic kullanmadan al, sonra güvenli cast yap
    const raw = (await redis.zrange("blog:index", 0, -1)) as unknown as string[];
    // En yeni → en eski
    slugs = Array.isArray(raw) ? [...raw].reverse() : [];
  } catch {
    slugs = [];
  }

  const blogEntries: MetadataRoute.Sitemap = [];
  for (const slug of slugs) {
    try {
      const it = await redis.hgetall<Record<string, string>>(`blog:post:${slug}`);
      if (!it) continue;

      const lm = it.updatedAt || it.createdAt || now.toISOString();
      blogEntries.push({
        url: `${base}/blog/${encodeURIComponent(slug)}`,
        lastModified: new Date(lm),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    } catch {
      // tekil hata olursa diğerlerine devam et
    }
  }

  return [...staticUrls, ...blogEntries];
}
