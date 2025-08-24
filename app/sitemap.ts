// app/sitemap.ts
import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";
import { redis } from "@/lib/redis"; // Projendeki mevcut Upstash Redis client

// Sitemap'i 5 dakikada bir yeniden üret (ISR)
// Yeni blog yazıları otomatik eklenir.
export const revalidate = 300;
// Bu dosya SSG+ISR çalışsın (request başına dinamik değil)
export const dynamic = "force-static";

type BlogUrl = { url: string; lastModified: Date };

async function getBlogUrls(): Promise<BlogUrl[]> {
  try {
    // En yeni -> en eski (rev: true). Çok büyük sitelerde dilersen slice ile 500-1000 ile sınırla.
    const slugs =
      (await redis.zrange<string>("blog:index", 0, -1, { rev: true })) || [];

    // İstersen üst sınır koy: const limited = slugs.slice(0, 1000);
    const rows = await Promise.all(
      slugs.map(async (slug) => {
        const it = await redis.hgetall<Record<string, string>>(
          `blog:post:${slug}`
        );
        if (!it) return null;

        const lm = it.updatedAt || it.createdAt || new Date().toISOString();
        return {
          url: `${SITE.url.replace(/\/$/, "")}/blog/${encodeURIComponent(
            slug
          )}`,
          lastModified: new Date(lm),
        } as BlogUrl | null;
      })
    );

    return rows.filter(Boolean) as BlogUrl[];
  } catch {
    // Redis geçici olarak erişilemezse blog linkleri olmadan döneriz
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url.replace(/\/$/, "");
  const now = new Date();

  // Sabit sayfalar
  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/hakkimizda`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/iletisim`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/gizlilik`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/kvkk`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/kullanim-kosullari`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
  ];

  const blogUrls = await getBlogUrls();

  // MetadataRoute.Sitemap tipine uysun diye map’liyoruz
  const blogEntries: MetadataRoute.Sitemap = blogUrls.map((b) => ({
    url: b.url,
    lastModified: b.lastModified,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticUrls, ...blogEntries];
}
