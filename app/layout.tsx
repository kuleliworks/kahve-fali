// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import { SITE } from "@/lib/seo";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url), // ör: https://kahvefalin.com (veya https://www.kahvefalin.com)
  title: {
    default: SITE.title,           // "Sanal Kahve Falı"
    template: `%s | ${SITE.name}`, // "Sayfa Başlığı | Sanal Kahve Falı"
  },
  description: SITE.description,
  applicationName: SITE.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE.url,
    title: SITE.title,
    description: SITE.description,
    siteName: SITE.name,
    images: [{ url: `${SITE.url}/resim/sanal-kahve-fali-x2.png` }], // mutlak URL
  },
  twitter: {
    card: "summary_large_image",
    site: SITE.twitter || undefined,
    title: SITE.title,
    description: SITE.description,
    images: [`${SITE.url}/resim/sanal-kahve-fali-x2.png`], // mutlak URL
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  robots: { index: true, follow: true },
  themeColor: "#ffffff",
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
      target: `${SITE.url}/ara?q={query}`, // istersen /blog araması bırakılabilir
      "query-input": "required name=query",
    },
  };

  return (
    <html lang="tr">
      <head>
        {/* Font Awesome (ikonlar) */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* JSON-LD: Organization */}
        <Script
          id="ld-org"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
        />
        {/* JSON-LD: WebSite (+ SearchAction) */}
        <Script
          id="ld-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSite) }}
        />
      </head>
      <body>
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
