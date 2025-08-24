// app/sitemap.ts — Blog yazılarını otomatik ekler, hata durumunda statik fallback döner
import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";
import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function baseUrl() {
  return (SITE.url || "https://www.kahvefalin.com").replace(/\/$/, "");
}

function safeDate(input: unknown): Date {
  if (!input) return new Date();
  if (typeof input === "number") {
    const d = new Date(input);
    if (!isNaN(d.getTime())) return d;
  }
  if (typeof input === "string") {
    const asNum = Number(input);
    const d = isNaN(asNum) ? new Date(input) : new Date(asNum);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date();
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const b = baseUrl();

  // 1) Önce statikleri hazır tut
  const base = staticEntries();

  try {
    // 2) Redis’ten slug listesi (en eski→en yeni), sonra ters çevir
    const raw = (await redis.zrange("blog:index", 0, -1)) as unknown;
    let slugs: string[] = Array.isArray(raw) ? (raw as string[]) : [];
    slugs = slugs.slice().reverse();

    // Çok büyük listelerde sitemap şişmesin
    if (slugs.length > 2000) slugs = slugs.slice(0, 2000);

    const items: MetadataRoute.Sitemap = [];
    for (const slug of slugs) {
      try {
        const it = await redis.hgetall<Record<string, string>>(`blog:post:${slug}`);
        if (!it) continue;

        const lm = safeDate(it.updatedAt ?? it.createdAt ?? undefined);
        items.push({
          url: `${b}/blog/${encodeURIComponent(slug)}`,
          lastModified: lm,
          changeFrequency: "weekly",
          priority: 0.7,
        });
      } catch {
        // tek tek hata verirse yut, diğerlerine devam et
      }
    }

    return [...base, ...items];
  } catch {
    // Redis tamamen patlarsa en azından statikler dönsün
    return base;
  }
}
