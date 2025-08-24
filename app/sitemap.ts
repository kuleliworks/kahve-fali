import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";
import { redis } from "@/lib/redis";

export const runtime = "nodejs";
export const revalidate = 300; // 5 dk
export const dynamic = "force-dynamic";

const TIME_BUDGET_MS = 1200;

function baseUrl() {
  return (SITE?.url || "https://www.kahvefalin.com").replace(/\/$/, "");
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

function wait(ms: number) {
  return new Promise<void>((res) => setTimeout(res, ms));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const b = baseUrl();
  const base = staticEntries();

  try {
    const job = (async () => {
      // Upstash TS tipleri 'unknown[]' döndürebilir; güvenli string'e map’le
      const raw = await redis.zrange("blog:index", 0, 49, { rev: true } as any);
      const slugs: string[] = Array.isArray(raw) ? raw.map((s: any) => String(s)) : [];
      if (slugs.length === 0) return [] as MetadataRoute.Sitemap;

      const rows = await Promise.all(
        slugs.map(async (slug) => {
          const it = await redis.hgetall<Record<string, string>>(`blog:post:${slug}`);
          if (!it) return null;
          const lm = safeDate(it.updatedAt || it.createdAt);
          const loc = `${b}/blog/${encodeURIComponent(slug)}`;
          return {
            url: loc,
            lastModified: lm,
            changeFrequency: "weekly",
            priority: 0.7,
          } as MetadataRoute.Sitemap[number];
        })
      );

      return rows.filter(Boolean) as MetadataRoute.Sitemap;
    })();

    const result = (await Promise.race([job, wait(TIME_BUDGET_MS).then(() => null)])) as
      | MetadataRoute.Sitemap
      | null;

    return result ? [...base, ...result] : base;
  } catch {
    return base;
  }
}
