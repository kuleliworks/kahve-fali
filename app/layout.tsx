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
    template: `%s | ${SITE.name}`, // sayfa başlığı | marka
  },
  description: SITE.description,
  alternates: { canonical: "/" },

  // ✅ Doğrudan sabit doğrulama etiketleri
  verification: {
    google: "Cv3ssHEFB23rmkNb-OhOhLaJxQHjwsalRU-KuCQ_fGM",
    other: {
      "msvalidate.01": "6E6995E00FED67845AA6CC88D06020FF", // Bing
      "yandex-verification": "ee719c548b858ddb",            // Yandex
      "p:domain_verify": "7a7ccc0055ac199b3220aa5e138d19ba" // Pinterest
    },
  },

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
    icon: "/resim/favicon.png",
    shortcut: "/resim/favicon.png",
    apple: "/resim/favicon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
      <head />
      <body>
        {/* Font Awesome */}
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="" />
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
          rel="stylesheet"
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
