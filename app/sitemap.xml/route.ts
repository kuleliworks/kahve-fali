// app/sitemap.xml/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 5 dak. CDN cache, arka planda tazele
const CACHE_HEADER = "s-maxage=300, stale-while-revalidate=86400";
const BASE = "https://www.kahvefalin.com";

type Item = {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
};

function staticItems(): Item[] {
  const now = new Date().toISOString();
  return [
    { loc: `${BASE}/`,                   lastmod: now, changefreq: "daily",   priority: "1.0" },
    { loc: `${BASE}/hakkimizda`,         lastmod: now, changefreq: "monthly", priority: "0.6" },
    { loc: `${BASE}/iletisim`,           lastmod: now, changefreq: "yearly",  priority: "0.3" },
    { loc: `${BASE}/gizlilik`,           lastmod: now, changefreq: "yearly",  priority: "0.3" },
    { loc: `${BASE}/kvkk`,               lastmod: now, changefreq: "yearly",  priority: "0.3" },
    { loc: `${BASE}/kullanim-kosullari`, lastmod: now, changefreq: "yearly",  priority: "0.3" },
    { loc: `${BASE}/blog`,               lastmod: now, changefreq: "daily",   priority: "0.8" },
  ];
}

function safeISO(input?: unknown): string | undefined {
  if (!input) return undefined;
  const n = typeof input === "string" ? Number(input) : input;
  const d = new Date(typeof n === "number" && !isNaN(n) ? n : (input as any));
  return isNaN(d.getTime()) ? undefined : d.toISOString();
}

async function withTimeout<T>(p: Promise<T>, ms = 1500): Promise<T> {
  return await Promise.race([
    p,
    new Promise<T>((_, rej) => setTimeout(() => rej(new Error("TIMEOUT")), ms)),
  ]);
}

async function fetchBlogItems(): Promise<Item[]> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return [];

  try {
    const { Redis } = await import("@upstash/redis");
    const redis = new Redis({ url, token });

    // En yeni 100 yazı (rev:true)
    const raw = await withTimeout(
      redis.zrange("blog:index", 0, 99, { rev: true } as any),
      1500
    ).catch(() => null);

    const slugs: string[] = Array.isArray(raw)
      ? (raw as unknown[]).map((s) => String(s))
      : [];

    if (!slugs.length) return [];

    const items: Item[] = [];
    for (const slug of slugs) {
      const meta = await withTimeout(
        redis.hgetall<Record<string, string>>(`blog:post:${slug}`),
        1500
      ).catch(() => null);
      if (!meta) continue;

      items.push({
        loc: `${BASE}/blog/${encodeURIComponent(slug)}`,
        lastmod: safeISO(meta.updatedAt || meta.createdAt),
        changefreq: "weekly",
        priority: "0.7",
      });
    }
    return items;
  } catch {
    return [];
  }
}

function toXML(items: Item[]): string {
  const nodes = items
    .map((x) => {
      const lastmod = x.lastmod ? `<lastmod>${x.lastmod}</lastmod>` : "";
      const cf = x.changefreq ? `<changefreq>${x.changefreq}</changefreq>` : "";
      const pr = x.priority ? `<priority>${x.priority}</priority>` : "";
      return `<url><loc>${x.loc}</loc>${lastmod}${cf}${pr}</url>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    nodes +
    `</urlset>`;
}

export async function GET() {
  // Statikler her zaman var, blog varsa eklenir
  const base = staticItems();
  const blog = await fetchBlogItems();
  const xml = toXML([...base, ...blog]);

  return new NextResponse(xml, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": CACHE_HEADER,
    },
  });
}
