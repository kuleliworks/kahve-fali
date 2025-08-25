// app/sitemap.ts
import type { MetadataRoute } from "next";
import { redis } from "@/lib/redis";
import { SITE } from "@/lib/seo";

export const dynamic = "force-dynamic";   // kesin runtime
export const revalidate = 300;            // 5 dk (istemezsen 0 da verebilirsin)

function safeDate(s?: string): Date {
  const d = s ? new Date(s) : new Date();
  return isNaN(d.getTime()) ? new Date() : d;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url.replace(/\/+$/, "");

  // Statik sayfalar (her durumda döner)
  const out: MetadataRoute.Sitemap = [
    { url: `${base}/`,               lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${base}/hakkimizda`,     lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/iletisim`,       lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${base}/gizlilik`,       lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${base}/kullanim-kosullari`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/kvkk`,           lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${base}/blog`,           lastModified: new Date(), changeFrequency: "daily",   priority: 0.7 },
  ];

  // Blog yazıları (Redis varsa eklenir; hata olursa sessizce atla)
  try {
    const raw = (await redis.zrange("blog:index", 0, -1, { rev: true })) as unknown[];
    const slugs = (raw as string[]).filter(Boolean).slice(0, 2000);

    if (slugs.length) {
      const posts = await Promise.all(
        slugs.map(async (slug) => {
          const row = await redis.hgetall<Record<string, string>>(`blog:post:${slug}`);
          if (!row) return null;
          if ((row.status || "draft") !== "pub") return null;

          return {
            slug,
            lm: safeDate(row.updatedAt || row.createdAt),
          };
        })
      );

      for (const p of posts) {
        if (!p) continue;
        out.push({
          url: `${base}/blog/${encodeURIComponent(p.slug)}`,
          lastModified: p.lm,
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
    }
  } catch {
    // Redis erişimi/typelar/ENV sorununda hiçbir şey yapma; statikler kalsın
  }

  return out;
}
