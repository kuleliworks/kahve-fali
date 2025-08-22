import type { Metadata } from "next";
import { SITE } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description:
    "Kahvefalin; modern arayüz ve gizlilik odaklı akışla sanal kahve falı ve online kahve falı deneyimini hızlı ve erişilebilir kılar.",
  alternates: { canonical: "/hakkimizda" },
};

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    url: `${SITE.url}/hakkimizda`,
    mainEntity: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
      logo: `${SITE.url}/resim/sanal-kahve-fali-x2.png`,
      sameAs: [SITE.url],
    },
    description:
      "Kahvefalin; gizlilik ve hız odaklı çevrimiçi kahve falı deneyimi sunar. Fotoğraflarını yükle, adım adım ilerle, sonucu paylaş.",
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      {/* HERO */}
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Hakkımızda</h1>
        <p className="mt-4 text-stone-700">
          Kahvefalin; <strong>sanal kahve falı</strong> ve <strong>online kahve falı</strong> deneyimini
          modern, hızlı ve çerezsiz bir akışla sunar. Amacımız geleneği dijital konforla buluşturmak.
        </p>
      </div>

      {/* BLOK 1 — Sol içerik / Sağ görsel */}
      <div className="mx-auto mt-12 grid gap-8 lg:grid-cols-2">
        <article className="prose-article">
          <h2>Misyon &amp; Değerler</h2>
          <p>
            Herkesin zahmetsizce, güvenle ve beklemeden kahve falı yorumuna ulaşabilmesini sağlıyoruz.
            Kullanıcı deneyimini yalın tutuyor, sonucu paylaşılabilir bir sayfada sunuyoruz.
          </p>
          <ul>
            <li><strong>Hız:</strong> Ortalama 20–30 saniyede sonuç.</li>
            <li><strong>Gizlilik:</strong> Form akışında çerez kullanılmaz.</li>
            <li><strong>Kullanılabilirlik:</strong> Adım adım, anlaşılır ve mobil uyumlu arayüz.</li>
          </ul>
        </article>

        {/* Sağ görsel */}
        <div className="k-card p-2">
          <div className="h-60 w-full overflow-hidden rounded-2xl sm:h-72 lg:h-80">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/resim/1-min.jpg"
              alt="Misyon & Değerler görseli"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      {/* BLOK 2 — Sol görsel / Sağ içerik */}
      <div className="mx-auto mt-12 grid gap-8 lg:grid-cols-2">
        {/* Sol görsel (mobilde alta, büyük ekranda sola) */}
        <div className="order-last k-card p-2 lg:order-first">
          <div className="h-60 w-full overflow-hidden rounded-2xl sm:h-72 lg:h-80">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/resim/2-min.jpg"
              alt="Yaklaşımımız görseli"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>

        <article className="prose-article">
          <h2>Yaklaşımımız</h2>
          <p>
            Kahve kültürünü koruyarak, teknolojinin sağladığı hız ve erişilebilirlikten en iyi şekilde faydalanıyoruz.
            Deneyimi sade tutuyor, her adımı net ve anlaşılır tasarlıyoruz.
          </p>
          <ul>
            <li><strong>Adım adım akış:</strong> İsim, fotoğraflar, temel bilgiler ve fal.</li>
            <li><strong>Paylaşılabilirlik:</strong> Tek tıkla X, WhatsApp ve daha fazlasına paylaş.</li>
            <li><strong>Mobil uyum:</strong> Kamera ile çekim desteği.</li>
          </ul>
        </article>
      </div>

      {/* BLOK 3 — Sol içerik / Sağ görsel */}
      <div className="mx-auto mt-12 grid gap-8 lg:grid-cols-2">
        <article className="prose-article">
          <h2>Yol Haritamız</h2>
          <div className="not-prose relative ml-2 border-l-2 border-stone-200 pl-6">
            <div className="relative mb-6">
              <span className="absolute -left-3 top-1.5 h-2.5 w-2.5 rounded-full bg-indigo-600" />
              <h3 className="font-semibold">2025 Q3 — Yayına Alma</h3>
              <p className="text-stone-700">Web deneyiminin yayına alınması, sonuç sayfası ve paylaşım altyapısı.</p>
            </div>
            <div className="relative mb-6">
              <span className="absolute -left-3 top-1.5 h-2.5 w-2.5 rounded-full bg-indigo-600" />
              <h3 className="font-semibold">Kısa Vade — Blog &amp; İçerik</h3>
              <p className="text-stone-700">Rehber yazılar, SSS ve örnek sonuçlarla organik büyüme.</p>
            </div>
            <div className="relative">
              <span className="absolute -left-3 top-1.5 h-2.5 w-2.5 rounded-full bg-indigo-600" />
              <h3 className="font-semibold">Orta Vade — Mobil Uygulama</h3>
              <p className="text-stone-700">iOS/Android uygulamaları ve bildirimlerle zenginleştirilmiş deneyim.</p>
            </div>
          </div>
        </article>

        {/* Sağ görsel */}
        <div className="k-card p-2">
          <div className="h-60 w-full overflow-hidden rounded-2xl sm:h-72 lg:h-80">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/resim/3-min.jpg"
              alt="Yol haritası görseli"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mx-auto mt-12 max-w-3xl">
        <a href="/#form" className="k-card block text-center transition hover:shadow-lg">
          <div className="text-sm text-stone-600">Hazır mısın?</div>
          <div className="mt-1 font-semibold">Falını hemen gönder</div>
        </a>
      </div>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </section>
  );
}
