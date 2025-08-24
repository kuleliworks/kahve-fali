import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const b = "https://www.kahvefalin.com";
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
