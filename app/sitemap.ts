// app/sitemap.ts  — GEÇİCİ MİNİMAL (sadece statik sayfalar)
// Derlemenin geçtiğini doğrulamak için önce bu sürümü kullanıyoruz.
import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

export const dynamic = "force-static";
export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url.replace(/\/$/, "");
  const now = new Date();

  return [
    { url: `${base}/`,                   lastModified: now, changeFrequency: "daily",   priority: 1 },
    { url: `${base}/hakkimizda`,         lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/iletisim`,           lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${base}/gizlilik`,           lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${base}/kvkk`,               lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${base}/kullanim-kosullari`, lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${base}/blog`,               lastModified: now, changeFrequency: "daily",   priority: 0.8 },
  ];
}
