import type { MetadataRoute } from "next";
import { redis } from "@/lib/redis";

// EŞİK: Eğer Redis env'lerinden biri yoksa, sadece statik döneriz.
const HAS_REDIS =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

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

export const revalidate = 300; // 5 dk

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = staticEntries();

  // Redis yoksa direkt statik dön.
  if (!HAS_REDIS) return base;

  try {
    // En yeni 0..49 (toplam 50) slug'ı çek (rev: true -> yeni->eski)
    const raw = (await redis.zrange("blog:index", 0, 49, { rev: true } as any)) as unknown;
    const slugs: string[] = Array.isArray(raw) ? raw.map((s: any) => String(s)) : [];
    if (slugs.length === 0) return base;

    const b = baseUrl();
    const rows = await Promise.all(
      slugs.map(async (slug) => {
        const it = await redis.hgetall<Record<string, string>>(`blog:post:${slug}`);
        if (!it) return null;
        return {
          url: `${b}/blog/${encodeURIComponent(slug)}`,
          lastModified: safeDate(it.updatedAt || it.createdAt),
          changeFrequency: "weekly",
          priority: 0.7,
        } as MetadataRoute.Sitemap[number];
      })
    );

    const blogPart = rows.filter(Boolean) as MetadataRoute.Sitemap;
    return [...base, ...blogPart];
  } catch {
    // Her türlü hata -> Statik listeye düş.
    return base;
  }
}
