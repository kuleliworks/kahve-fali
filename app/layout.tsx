// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import { SITE } from "@/lib/seo";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.title,           // "Sanal Kahve Falı"
    template: `%s | ${SITE.name}`, // şablon burada
  },
  description: SITE.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE.url,
    title: SITE.title,
    description: SITE.description,
    siteName: SITE.name,
    images: [{ url: `${SITE.url}/resim/sanal-kahve-fali-x2.png` }],
  },
  twitter: {
    card: "summary_large_image",
    site: SITE.twitter || undefined,
    title: SITE.title,
    description: SITE.description,
    images: [`${SITE.url}/resim/sanal-kahve-fali-x2.png`],
  },
    icons: {
    icon: "/resim/favicon.png",       // tarayıcı favicon
    shortcut: "/resim/favicon.png",   // eski tarayıcılar
    apple: "/resim/favicon.png",      // iOS ana ekrana ekleme
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // JSON-LD’leri Script ile ekliyoruz (head’i override etmeden)
  const jsonLdOrg = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    logo: `${SITE.url}/resim/sanal-kahve-fali-x2.png`,
  };
  const jsonLdSite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.title,
    url: SITE.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE.url}/blog?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="tr">
      {/* DİKKAT: Burada <head> içine hiçbir manuel içerik koymuyoruz */}
      <head />
      <body>
        {/* Font Awesome CDN (istersen Footer/Nav içinde de linkleyebilirsin) */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />

        <Nav />
        <main>{children}</main>
        <Footer />

        {/* JSON-LD */}
        <Script
          id="jsonld-org"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
        />
        <Script
          id="jsonld-site"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSite) }}
        />
      </body>
    </html>
  );
}
