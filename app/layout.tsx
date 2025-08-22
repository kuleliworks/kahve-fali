import "./globals.css";
import type { Metadata } from "next";
import { SITE } from "@/lib/seo";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.title,           // "Sanal Kahve Falı"
    template: `%s | ${SITE.name}`, // <<— ŞABLON
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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head />
      <body>
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
