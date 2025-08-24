import type { MetadataRoute } from "next";

/** Bu dosyayı runtime'da çalıştır, build'te dondurma */
export const dynamic = "force-dynamic";
export const revalidate = 300; // 5 dk cache
export const runtime = "nodejs"; // edge ile olası fetch/Headers farklarını önler

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = staticEntries();

  // Env yoksa hiç uğraşma, statik dön
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return base;

  try {
    // Redis’i güvenli şekilde local burada oluştur
    const { Redis } = await import("@upstash/redis");
    const redis = new Redis({ url, token });

    // En yeni 50 yazı (rev:true => yeni->eski)
    const raw: unknown = await redis.zrange("blog:index", 0, 49, { rev: true } as any);
    const slugs: string[] = Array.isArray(raw) ? raw.map((s: any) => String(s)) : [];
    if (slugs.length === 0) return base;

    const b = baseUrl();
    const rows: MetadataRoute.Sitemap = [];

    for (const slug of slugs) {
      const it = await redis.hgetall<Record<string, string>>(`blog:post:${slug}`);
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
    // Ne olursa olsun asla boş dönme
    return base;
  }
}
