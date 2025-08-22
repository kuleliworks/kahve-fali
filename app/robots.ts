// app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Arama motorlarının taramasını istemediğimiz alanlar:
      disallow: ["/fal/", "/panel/", "/api/"],
    },
    sitemap: "https://kahvefalin.com/sitemap.xml",
    host: "https://kahvefalin.com",
  };
}
