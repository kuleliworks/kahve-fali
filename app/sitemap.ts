// app/sitemap.ts
import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

// KV kullanıyorsan (panel için) bu util zaten var; yoksa yorum satırı yapabilirsin
import { redis } from "@/lib/redis"; // UPSTASH/Redis util’in

import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic"; // KV'den de okuyabilmek için

async function getBlogSlugsFromFS(): Promise<string[]> {
  try {
    const dir = path.join(process.cwd(), "content", "posts");
    const files = await fs.readdir(dir);
    return files
      .filter((f) => /\.mdx?$/i.test(f))
      .map((f) => f.replace(/\.(mdx?|MDX|Md)$/i, ""));
  } catch {
    return [];
  }
}

// KV tarafı: blog:index (zset) → slug’lar
async function getBlogSlugsFromKV(): Promise<string[]> {
  try {
    // zrange with rev = en yeni > en eski
    // @ts-ignore – tip farkı olursa es geç
    const slugs = await redis.zrange<string>("blog:index", 0, -1, { rev: true });
    return Array.isArray(slugs) ? slugs : [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url.replace(/\/$/, "");

  // 1) Statik sayfalar (kurumsal/yasal + blog ana sayfa)
  const staticPaths: MetadataRoute.Sitemap = [
    "/",                // ana sayfa
    "/hakkimizda",
    "/iletisim",
    "/gizlilik",
    "/kvkk",
    "/kullanim-kosullari",
    "/blog",
  ].map((p) => ({
    url: `${base}${p}`,
    lastModified: new Date(),
  }));

  // 2) Blog yazıları (FS + KV birleşik)
  const [fsSlugs, kvSlugs] = await Promise.all([
    getBlogSlugsFromFS(),
    getBlogSlugsFromKV(),
  ]);

  const allSlugs = Array.from(new Set([...fsSlugs, ...kvSlugs]));

  const blogItems: MetadataRoute.Sitemap = allSlugs.map((slug) => ({
    url: `${base}/blog/${slug}`,
    lastModified: new Date(),
  }));

  return [...staticPaths, ...blogItems];
}
