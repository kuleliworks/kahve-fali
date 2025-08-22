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

        {/* Sağ görsel — 1200×900, orana göre akıyor */}
        <div className="k-card p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/resim/1-min.jpg"
            alt="Misyon & Değerler görseli"
            className="w-full h-auto rounded-2xl object-cover"
            loading="lazy"
          />
        </div>
      </div>

      {/* BLOK 2 — Sol görsel / Sağ içerik */}
      <div className="mx-auto mt-12 grid gap-8 lg:grid-cols-2">
        {/* Sol görsel — 1200×900, orana göre akıyor */}
        <div className="order-last k-card p-2 lg:order-first">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/resim/2-min.jpg"
            alt="Yaklaşımımız görseli"
            className="w-full h-auto rounded-2xl object-cover"
            loading="lazy"
          />
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

      {/* BLOK 3 — Sol içerik / Sağ görsel (Yol Haritası yerine Güvence & İlkeler) */}
      <div className="mx-auto mt-12 grid gap-8 lg:grid-cols-2">
        <article className="prose-article">
          <h2>Güvence &amp; İlkeler</h2>
          <ul>
            <li><strong>Şeffaflık:</strong> Sonuç sayfasında açık ve anlaşılır metin; yanıltıcı vaat yok.</li>
            <li><strong>İçerik kalitesi:</strong> Net çekim önerileri ve anlaşılır yorum dili.</li>
            <li><strong>Erişilebilirlik:</strong> Mobil öncelikli tasarım ve yüksek performans.</li>
            <li><strong>Destek:</strong> Soruların için <a href="/iletisim">iletişim</a> kanalımız açık.</li>
          </ul>
          <div className="k-note mt-4 text-sm text-stone-700">
            <i className="fa-regular fa-circle-check mr-2" />
            Form akışında çerez kullanılmaz; gizlilik odaklı bir deneyim sunarız.
          </div>
        </article>

        {/* Sağ görsel — 1200×900, orana göre akıyor */}
        <div className="k-card p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/resim/3-min.jpg"
            alt="Güvence & İlkeler görseli"
            className="w-full h-auto rounded-2xl object-cover"
            loading="lazy"
          />
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
