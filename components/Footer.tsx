import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-stone-200 bg-white/60 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* 4 sütun */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* 1. Sütun — Marka */}
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <Image
                src="/resim/sanal-kahve-fali-x2.png"
                alt="Sanal Kahve Falı"
                width={40}
                height={40}
                className="h-10 w-10 rounded-md object-contain"
              />
              <span className="text-lg font-semibold">Sanal Kahve Falı</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-stone-600">
              “Falını hızlıca gönder, modern arayüzde sonucu gör. Paylaşılabilir bağlantı, çerezsiz akış.”
            </p>
          </div>

          {/* 2. Sütun — Keşfet */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-600">Keşfet</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link className="hover:underline" href="/">Anasayfa</Link></li>
              <li><Link className="hover:underline" href="/hakkimizda">Hakkımızda</Link></li>
              <li><a className="hover:underline" href="/#form">Falını Gönder</a></li>
              <li><Link className="hover:underline" href="/iletisim">İletişim</Link></li>
            </ul>
          </div>

          {/* 3. Sütun — Hukuki */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-600">Hukuki</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link className="hover:underline" href="/gizlilik">Gizlilik Politikası</Link></li>
              <li><Link className="hover:underline" href="/kvkk">KVKK Aydınlatma Metni</Link></li>
              <li><Link className="hover:underline" href="/kullanim-kosullari">Kullanım Koşulları</Link></li>
              <li><a className="hover:underline" href="/sitemap.xml">Sitemap</a></li>
              <li><a className="hover:underline" href="/robots.txt">Robots.txt</a></li>
            </ul>
          </div>

          {/* 4. Sütun — İletişim & Sosyal */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-600">İletişim &amp; Sosyal</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a className="hover:underline" href="mailto:info@kahvefalin.com">
                  <i className="fa-regular fa-envelope mr-2" />
                  info@kahvefalin.com
                </a>
              </li>
              <li className="flex items-center gap-3 pt-1">
                <a
                  className="inline-flex items-center gap-2 rounded-md border border-stone-300 px-3 py-1.5 text-sm hover:bg-stone-50"
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    "Sanal Kahve Falı — falını gönder, sonucu hemen gör!"
                  )}&url=${encodeURIComponent("https://kahvefalin.com")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fa-brands fa-x-twitter" />
                  X
                </a>
                <a
                  className="inline-flex items-center gap-2 rounded-md border border-stone-300 px-3 py-1.5 text-sm hover:bg-stone-50"
                  href={`https://wa.me/?text=${encodeURIComponent(
                    "Sanal Kahve Falı — falını gönder, sonucu hemen gör! https://kahvefalin.com"
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fa-brands fa-whatsapp" />
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Alt bar */}
        <div className="mt-10 border-t border-stone-200 pt-6 text-xs text-stone-600">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <Image
                src="/resim/sanal-kahve-fali-x2.png"
                alt="Sanal Kahve Falı"
                width={20}
                height={20}
                className="h-5 w-5 rounded object-contain"
              />
              <span>© 2025 Sanal Kahve Falı • kahvefalin.com</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-stone-100 px-3 py-1">Türkiye’de geliştirildi ☕</span>
              <span className="text-stone-400">•</span>
              <span>Eğlence amaçlıdır — 18+</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
