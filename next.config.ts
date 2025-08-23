import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Cloudflare R2 örnekleri
      { protocol: "https", hostname: "*.r2.dev" },
      { protocol: "https", hostname: "imagedelivery.net" },

      // S3/Supabase olasılıkları
      { protocol: "https", hostname: "*.amazonaws.com" },
      { protocol: "https", hostname: "*.supabase.co" },

      // Kendi domain’in (eğer görseller buradan servis ediliyorsa)
      { protocol: "https", hostname: "kahvefalin.com" },
      { protocol: "https", hostname: "*.kahvefalin.com" },
    ],
  },
};

export default nextConfig;
