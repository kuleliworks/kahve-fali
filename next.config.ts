import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Kendi alan adın (eğer /uploads gibi kendi domaininden veriyorsan)
      { protocol: "https", hostname: "kahvefalin.com" },
      { protocol: "https", hostname: "*.kahvefalin.com" },

      // Cloudflare R2 (public bucket)
      { protocol: "https", hostname: "*.r2.dev" },

      // Cloudflare Images (kullanıyorsan)
      { protocol: "https", hostname: "imagedelivery.net" },

      // Amazon S3 olasılığı
      { protocol: "https", hostname: "*.amazonaws.com" },

      // Supabase Storage olasılığı
      { protocol: "https", hostname: "*.supabase.co" },

      // Diğer olası CDN’lerin varsa buraya ekle
      // { protocol: "https", hostname: "cdn.ornek.com" },
    ],
    // format iyileştirme (opsiyonel)
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
