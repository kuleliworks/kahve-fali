import "./globals.css";
import type { Metadata } from "next";
import { SITE } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.title,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE.url,
    title: SITE.title,
    description: SITE.description,
    siteName: SITE.name,
    images: [{ url: "/resim/sanal-kahve-fali-x2.png" }],
  },
  twitter: {
    card: "summary_large_image",
    site: SITE.twitter || undefined,
    title: SITE.title,
    description: SITE.description,
    images: ["/resim/sanal-kahve-fali-x2.png"],
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
      <head>
        {/* Font Awesome (ikonlar için) */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* JSON-LD */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSite) }} />
      </head>
      <body>
        <header className="border-b bg-white/70 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <a href="/" className="flex items-center gap-2">
              <img src="/resim/sanal-kahve-fali-x2.png" alt="Logo" width={130} height={40} style={{ height: 40 }} />
            </a>
            <nav className="hidden items-center gap-6 text-sm text-neutral-700 sm:flex">
              <a href="/" className="hover:text-neutral-900">Ana Sayfa</a>
              <a href="/blog" className="hover:text-neutral-900">Blog</a>
              <a href="/hakkimizda" className="hover:text-neutral-900">Hakkımızda</a>
              <a href="/iletisim" className="hover:text-neutral-900">İletişim</a>
              <a href="/#form" className="btn btn-primary">Fal Gönder</a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
