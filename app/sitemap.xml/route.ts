import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { SITE } from "@/lib/seo";

export const runtime = "nodejs";          // Edge yerine Node; Upstash/fetch daha stabil
export const dynamic = "force-dynamic";   // CDN'de saplanmasın
export const revalidate = 300;            // 5 dk cache

function abs(url: string) {
  const base = SITE.url.replace(/\/+$/, "");
  return /^https?:\/\//i.test(url) ? url : `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function GET() {
  const today = new Date().toISOString().slice(0, 10);

  // 1) Statik sayfalar
  const urls: Array<{ loc: string; lastmod: string; changefreq: string; priority: string }> = [
    { loc: abs("/"),                 lastmod: today, changefreq: "daily",   priority: "1.0" },
    { loc: abs("/hakkimizda"),       lastmod: today, changefreq: "monthly", priority: "0.6" },
    { loc: abs("/iletisim"),         lastmod: today, changefreq: "yearly",  priority: "0.3" },
    { loc: abs("/gizlilik"),         lastmod: today, changefreq: "yearly",  priority: "0.3" },
    { loc: abs("/kvkk"),             lastmod: today, changefreq: "yearly",  priority: "0.3" },
    { loc: abs("/kullanim-kosullari"), lastmod: today, changefreq: "yearly", priority: "0.3" },
    { loc: abs("/blog"),             lastmod: today, changefreq: "daily",   priority: "0.8" },
    // /fal/* kasıtlı olarak yok (robots.txt’te de Disallow)
  ];

  // 2) Blog yazıları — KV’den; takılırsa 1.2 sn’de vazgeç
  try {
    const slugs = await Promise.race([
      redis.zrange("blog:index", 0, 500, { rev: true }) as Promise<string[]>,
      new Promise<string[]>((_, rej) => setTimeout(() => rej(new Error("kv-timeout")), 1200)),
    ]);

    for (const slug of slugs || []) {
      const it = await redis.hgetall<Record<string, string>>(`blog:post:${slug}`);
      if (!it || it.status !== "pub") continue;
      const lastmod = it.updatedAt ? new Date(Number(it.updatedAt)).toISOString().slice(0, 10) : today;
      urls.push({
        loc: abs(`/blog/${slug}`),
        lastmod,
        changefreq: "weekly",
        priority: "0.7",
      });
    }
  } catch {
    // KV yoksa sessizce sadece statik kayıtları döndür
  }

  // 3) XML oluştur
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map(
        (u) =>
          `  <url><loc>${esc(u.loc)}</loc><lastmod>${u.lastmod}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`
      )
      .join("\n") +
    `\n</urlset>\n`;

  return new NextResponse(xml, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=300",
    },
  });
}
