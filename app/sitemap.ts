// app/sitemap.ts
import type { MetadataRoute } from "next";
import { redis } from "@/lib/redis";
import { SITE } from "@/lib/seo";

// Sık çalışmasın ama “takılı” da kalmasın
export const revalidate = 300; // 5 dk

function abs(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE.url}${path.startsWith("/") ? "" : "/"}${path}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Statik sayfalar
  const items: MetadataRoute.Sitemap = [
    { url: abs("/"),                 lastModified: now, changeFrequency: "daily",   priority: 1.0 },
    { url: abs("/hakkimizda"),       lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: abs("/iletisim"),         lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: abs("/gizlilik"),         lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: abs("/kvkk"),             lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: abs("/kullanim-kosullari"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: abs("/blog"),             lastModified: now, changeFrequency: "daily",   priority: 0.8 },
    // NOT: /fal/* bilerek eklemiyoruz (robots.txt ile de kapalı)
  ];

  // Blog yazıları (KV’den, kısa timeout’la)
  try {
    const slugs = await Promise.race([
      redis.zrange("blog:index", 0, 200, { rev: true }) as Promise<string[]>,
      new Promise<string[]>((_, rej) => setTimeout(() => rej(new Error("kv-timeout")), 1200)),
    ]);

    for (const slug of slugs || []) {
      const it = await redis.hgetall<Record<string, string>>(`blog:post:${slug}`);
      if (!it || it.status !== "pub") continue;

      items.push({
        url: abs(`/blog/${slug}`),
        lastModified: it.updatedAt ? new Date(Number(it.updatedAt)) : now,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch {
    // KV çalışmıyorsa sessizce statik kayıtlarla yetin
  }

  return items;
}
