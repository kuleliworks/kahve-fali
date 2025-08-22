import type { Metadata } from "next";
import { SITE } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description:
    "Kahvefalin; modern arayüz ve gizlilik odaklı akışla sanal kahve falı ve online kahve falı deneyimini herkes için hızlı ve erişilebilir kılar.",
  alternates: { canonical: "/hakkimizda" },
};

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "url": `${SITE.url}/hakkimizda`,
    "mainEntity": {
      "@type": "Organization",
      "name": SITE.name,
      "url": SITE.url,
      "logo": `${SITE.url}/resim/sanal-kahve-fali-x2.png`,
      "sameAs": [SITE.url]
    },
    "description":
      "Kahvefalin; gizlilik ve hız odaklı çevrimiçi kahve falı deneyimi sunar. Fotoğraflarını yükle, adım adım ilerle, sonucu paylaş."
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      {/* HERO */}
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Hakkımızda</h1>
        <p className="mt-4 text-stone-700">
          Kahvefalin; <strong>sanal kahve falı</strong> ve <strong>online kahve falı</strong> deneyimini
          modern, hızlı ve çerezsiz bir akışla sunar. Amacımız; geleneği dijital konforla buluşturmak.
        </p>
      </div>

      {/* İKİ SÜTUN: Sol içerik, sağ öne çıkanlar */}
      <div className="mx-auto mt-10 grid max-w-6xl gap-8 lg:grid-cols-[1.6fr,1fr]">
        {/* SOL: Kurumsal metin */}
        <article className="prose-article">
          <h2>Misyonumuz</h2>
          <p>
            Herkesin zahmetsizce, güvenle ve beklemeden kahve falı yorumuna ulaşabilmesini sağlamak.
            Kullanıcı deneyimini yalın tutuyor, sonucu paylaşılabilir bir sayfada sunuyoruz.
          </p>

          <h2>Vizyonumuz</h2>
          <p>
            Kahve kültürünü koruyarak, teknolojinin sağladığı hız ve erişilebilirlikten en iyi şekilde faydalanmak.
            Yakında uygulama deneyimini de güçlendirerek çok kanallı bir platforma dönüşmeyi hedefliyoruz.
          </p>

          <h2>Yaklaşımımız</h2>
          <ul>
            <li><strong>Hız:</strong> Ortalama 20–30 saniyede sonuç sayfası.</li>
            <li><strong>Gizlilik:</strong> Form akışında çerez kullanılmaz.</li>
            <li><strong>Kullanılabilirlik:</strong> Adım adım, anlaşılır ve mobil uyumlu arayüz.</li>
            <li><strong>Paylaşılabilirlik:</strong> Tek tıkla X, WhatsApp ve daha fazlası.</li>
          </ul>

          <h2>Güvenlik &amp; Gizlilik</h2>
          <p>
            Yüklenen görseller ve form adımları gizlilik odaklı bir akışla işlenir.
            Kullanıcıyı takip eden çerezler kullanmıyoruz. Gerekli hukuki metinler (Gizlilik, KVKK, Kullanım Koşulları)
            yayınlandığında bağlantıları bu sayfaya eklenecek.
          </p>

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
              <p className="text-stone-700">Rehber yazılar, sık sorulan sorular ve örnek sonuçlarla organik büyüme.</p>
            </div>
            <div className="relative">
              <span className="absolute -left-3 top-1.5 h-2.5 w-2.5 rounded-full bg-indigo-600" />
              <h3 className="font-semibold">Orta Vade — Mobil Uygulama</h3>
              <p className="text-stone-700">iOS/Android uygulamaları ve bildirimlerle zenginleştirilmiş deneyim.</p>
            </div>
          </div>
        </article>

        {/* SAĞ: Öne çıkanlar / iletişim / CTA */}
        <aside className="space-y-4">
          <div className="k-card">
            <div className="k-badge"><i className="fa-solid fa-sparkles" /> Öne Çıkanlar</div>
            <ul className="k-list-check mt-3">
