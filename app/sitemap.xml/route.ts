// app/sitemap.xml/route.ts
import { NextResponse } from "next/server";
import { SITE } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const runtime = "edge"; // Upstash ile uyumlu, hızlı

// Güvenli tarih
function safeISO(d?: string) {
  try {
    const dt = d ? new Date(d) : new Date();
    return isNaN(dt.getTime()) ? new Date().toISOString() : dt.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

export async function GET() {
  const base = SITE.url.replace(/\/+$/, "");

  // Statik sayfalar (her koşulda var)
  const urls: Array<{ loc: string; lastmod?: string; changefreq?: string; priority?: string }> = [
    { loc: `${base}/`,                  changefreq: "daily",  priority: "1.0", lastmod: new Date().toISOString() },
    { loc: `${base}/hakkimizda`,        changefreq: "monthly", priority: "0.6", lastmod: new Date().toISOString() },
    { loc: `${base}/iletisim`,          changefreq: "yearly",  priority: "0.3", lastmod: new Date().toISOString() },
    { loc: `${base}/gizlilik`,          changefreq: "yearly",  priority: "0.3", lastmod: new Date().toISOString() },
    { loc: `${base}/kullanim-kosullari`,changefreq: "yearly",  priority: "0.3", lastmod: new Date().toISOString() },
    { loc: `${base}/kvkk`,              changefreq: "yearly",  priority: "0.3", lastmod: new Date().toISOString() },
    { loc: `${base}/blog`,              changefreq: "daily",   priority: "0.7", lastmod: new Date().toISOString() },
  ];

  // Blog yazıları (Redis varsa ekle; olmazsa statikler yine döner)
  try {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (url && token) {
      const { Redis } = await import("@upstash/redis");
      const redis = new Redis({ url, token });

      // En yeni → en eski
      const raw = (await redis.zrange("blog:index", 0, -1, { rev: true })) as unknown[];
      const slugs = (raw as string[]).filter(Boolean).slice(0, 2000);

      for (const slug of slugs) {
        const post = await redis.hgetall<Record<string, string>>(`blog:post:${slug}`);
        if (!post) continue;
        if ((post.status || "draft") !== "pub") continue;

        urls.push({
          loc: `${base}/blog/${encodeURIComponent(slug)}`,
          changefreq: "weekly",
          priority: "0.7",
          lastmod: safeISO(post.updatedAt || post.createdAt),
        });
      }
    }
  } catch {
    // Sessizce yut: Redis yoksa/bozuksa sadece statikler kalsın.
  }

  // XML üret
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urls
      .map((u) => {
        const last = u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : "";
        const cf = u.changefreq ? `<changefreq>${u.changefreq}</changefreq>` : "";
        const pr = u.priority ? `<priority>${u.priority}</priority>` : "";
        return `<url><loc>${u.loc}</loc>${last}${cf}${pr}</url>`;
      })
      .join("") +
    `</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
