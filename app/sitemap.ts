import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url;
  // Fal sonuçları noindex + paylaşımlık; sitemap'e eklemiyoruz.
  const routes = ["", "/blog", "/hakkimizda", "/iletisim"]; // sayfalar eklenince burada dursun
  const now = new Date();

  return routes.map((p) => ({
    url: `${base}${p || "/"}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: p === "" ? 1 : 0.7,
  }));
}
