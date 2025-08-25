// app/sitemap.ts
import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 300; // 5 dk
export const runtime = "nodejs";

function baseUrl() {
  return "https://www.kahvefalin.com";
}

function staticEntries(): MetadataRoute.Sitemap {
  const b = baseUrl();
  const now = new Date();
  return [
    { url: `${b}/`,                   lastModified: now, changeFrequency: "daily",   priority: 1 },
    { url: `${b}/hakkimizda`,         lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${b}/iletisim`,           lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${b}/gizlilik`,           lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${b}/kvkk`,               lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${b}/kullanim-kosullari`, lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${b}/blog`,               lastModified: now, changeFrequency: "daily",   priority: 0.8 },
  ];
}

function safeDate(input?: unknown): Date {
  if (!input) return new Date();
  if (typeof input === "number") {
    const d = new Date(input);
    return isNaN(d.getTime()) ? new Date() : d;
  }
  if (typeof input === "string") {
    const n = Number(input);
    const d = isNaN(n) ? new Date(input) : new Date(n);
    return isNaN(d.getTime()) ? new Date() : d;
  }
  return new Date();
}

async function withTimeout<T>(p: Promise<T>, ms = 1500): Promise<T> {
  return await Promise.race([
    p,
    new Promise<T>((_, rej) => setTimeout(() => rej(new Error("TIMEOUT")), ms)),
  ]);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = staticEntries();

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return base;

  try {
    const { Redis } = await import("@upstash/redis");
    const redis = new Redis({ url, token });

    // En yeni 50 yazı
    const raw = await withTimeout(
      // tip sistemini rahatlatmak için 'as any'
      redis.zrange("blog:index", 0, 49, { rev: true } as any),
      1500
    ).catch(() => null);

    const slugs: string[] = Array.isArray(raw)
      ? (raw as unknown[]).map((s) => String(s))
      : [];

    if (slugs.length === 0) return base;

    const b = baseUrl();
    const rows: MetadataRoute.Sitemap = [];

    for (const slug of slugs) {
      // her ihtimale karşı time-out ile sar
      const it = await withTimeout(
        redis.hgetall<Record<string, string>>(`blog:post:${slug}`),
        1500
      ).catch(() => null);
      if (!it) continue;

      rows.push({
        url: `${b}/blog/${encodeURIComponent(slug)}`,
        lastModified: safeDate(it.updatedAt || it.createdAt),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }

    return [...base, ...rows];
  } catch {
    return base;
  }
}
