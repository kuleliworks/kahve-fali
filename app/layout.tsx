import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sanal Kahve Falı",
  description: "Fotoğrafını yükle, adım adım ilerle ve online kahve falı sonucunu gör.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>

      <body>
        <header className="border-b bg-white/70 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <a href="/" className="flex items-center gap-2">
              {/* Logoyu birazdan public klasörüne yükleyeceğiz */}
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
