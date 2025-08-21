export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-stone-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-3">
        {/* Sol: Logo + kısa tanım + sosyal */}
        <div>
          <a href="/" className="inline-flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/resim/sanal-kahve-fali-x2.png"
              alt="Kahvefalin"
              width={140}
              height={42}
              style={{ height: 42 }}
            />
          </a>
          <p className="mt-4 text-sm text-stone-600">
            Fotoğraflarını yükleyerek <strong>sanal kahve falı</strong> ve{" "}
            <strong>online kahve falı</strong> deneyimini hızlı ve çerezsiz yaşa.
          </p>

          <div className="mt-4 flex items-center gap-3 text-stone-600">
            <a
              href="https://x.com/intent/follow?screen_name="
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl ring-1 ring-stone-200 hover:bg-stone-50"
              aria-label="X hesabı"
            >
              <i className="fa-brands fa-x-twitter" />
            </a>
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl ring-1 ring-stone-200 hover:bg-stone-50"
              aria-label="Instagram"
            >
              <i className="fa-brands fa-instagram" />
            </a>
            <a
              href="mailto:info@kahvefalin.com"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl ring-1 ring-stone-200 hover:bg-stone-50"
              aria-label="E-posta"
            >
              <i className="fa-regular fa-envelope" />
            </a>
          </div>
        </div>

        {/* Orta: Bağlantılar */}
        <div>
          <div className="text-sm font-semibold text-stone-900">Bağlantılar</div>
          <ul className="mt-3 space-y-2 text-sm text-stone-700">
            <li><a className="hover:underline" href="/">Ana Sayfa</a></li>
            <li><a className="hover:underline" href="/blog">Blog</a></li>
            <li><a className="hover:underline" href="/hakkimizda">Hakkımızda</a></li>
            <li><a className="hover:underline" href="/iletisim">İletişim</a></li>
            <li><a className="hover:underline" href="/#form">Fal Gönder</a></li>
          </ul>
        </div>

        {/* Sağ: Yardım & Hukuki */}
        <div>
          <div className="text-sm font-semibold text-stone-900">Yardım &amp; Hukuki</div>
          <ul className="mt-3 space-y-2 text-sm text-stone-700">
            <li><a className="hover:underline" href="/#sss">Sık Sorulan Sorular</a></li>
            <li>
              <a className="hover:underline" href="/gizlilik">Gizlilik Politikası</a>{" "}
              <span className="text-xs text-stone-500">(yakında)</span>
            </li>
            <li>
              <a className="hover:underline" href="/kullanim-kosullari">Kullanım Koşulları</a>{" "}
              <span className="text-xs text-stone-500">(yakında)</span>
            </li>
            <li className="text-xs text-stone-500">Form akışında çerez kullanılmaz.</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-stone-200">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Kahvefalin • Tüm hakları saklıdır.</p>
          <p>İstanbul, Türkiye</p>
        </div>
      </div>
    </footer>
  );
}
