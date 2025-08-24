import type { MetadataRoute } from "next";
import { redis } from "@/lib/redis";
import { SITE } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url;

  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: new Date() },
    { url: `${base}/hakkimizda`, lastModified: new Date() },
    { url: `${base}/iletisim`, lastModified: new Date() },
    { url: `${base}/gizlilik`, lastModified: new Date() },
    { url: `${base}/kvkk`, lastModified: new Date() },
    { url: `${base}/kullanim-kosullari`, lastModified: new Date() },
    { url: `${base}/blog`, lastModified: new Date() },
  ];

  try {
    const slugs = (await redis.zrange("blog:index", 0, -1, { rev: true })) as string[];
    const items: MetadataRoute.Sitemap = [];
    for (const slug of slugs || []) {
      const it = await redis.hgetall<Record<string, string>>(`blog:post:${slug}`);
      if (it && it.status === "pub") {
        items.push({
          url: `${base}/blog/${slug}`,
          lastModified: it.updatedAt ? new Date(Number(it.updatedAt)) : new Date(),
        });
      }
    }
    return [...staticUrls, ...items];
  } catch {
    return staticUrls;
  }
}
