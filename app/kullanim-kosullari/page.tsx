import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kullanım Koşulları — Sanal Kahve Falı",
  description:
    "Sanal Kahve Falı kullanım koşulları: hizmet kapsamı, yasaklar, fikri haklar, sorumluluk sınırlamaları ve uygulanacak hukuk.",
  alternates: { canonical: "/kullanim-kosullari" },
};

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Kullanım Koşulları",
    url: "https://kahvefalin.com/kullanim-kosullari",
    inLanguage: "tr-TR",
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-center">Kullanım Koşulları</h1>
      <p className="mt-4 text-center text-stone-700">Güncelleme tarihi: 22 Ağustos 2025</p>

      <article className="prose-article mx-auto mt-8">
        <h2>1) Hizmetin Niteliği (Eğlence Amaçlıdır)</h2>
        <p>
          Sanal Kahve Falı; kahve fincanı fotoğrafları ve verilen sınırlı bilgilere dayanarak <strong>eğlence amaçlı</strong> yorumlar üretir.
          Hizmet <strong>tıbbi, hukuki, finansal, psikolojik veya profesyonel danışmanlık</strong> sunmaz; kararlarını bu
          içeriklere dayandırmamalısın.
        </p>
        <p><strong>18+</strong>: Hizmet yalnızca 18 yaş ve üzeri kullanıcılar içindir.</p>

        <h2>2) Kullanıcı Yükümlülükleri</h2>
        <ul>
          <li>Yüklediğin görseller ve ilettiğin içerikten yalnızca sen sorumlusun.</li>
          <li>Üçüncü kişilerin haklarını ihlal eden, yasa dışı, müstehcen, nefret söylemi içeren veya kişisel veriler barındıran içerik yüklenemez.</li>
          <li>Başkasına ait kişisel verileri (özellikle özel nitelikli/sensitive) paylaşmaktan kaçınmalısın.</li>
          <li>Hizmeti kötüye kullanmak, tersine mühendislik veya yetkisiz erişim girişimleri yasaktır.</li>
        </ul>

        <h2>3) İçerik ve Lisans</h2>
        <p>
          Görsel yükleyerek; bu görselleri Hizmet’i sağlamak amacıyla barındırmamız, işleyip ölçeklememiz ve sonucu
          oluşturmak için geçici sürelerle çoğaltmamız için bize <strong>sınırlı, geri alınabilir, alt lisanslanamaz</strong> bir
          lisans verdiğini kabul edersin.
        </p>

        <h2>4) Fikri Mülkiyet</h2>
        <p>
          Site tasarımı, metinler ve yazılım bileşenleri dâhil tüm bileşenler ilgili mevzuat uyarınca korunur.
          İçerikler izinsiz kopyalanamaz/çoğaltılamaz.
        </p>

        <h2>5) Sorumluluğun Sınırlandırılması</h2>
        <p>
          Hizmet “olduğu gibi” sunulur. Dolaylı, arızi, özel veya sonuçsal zararlardan (kâr kaybı, veri kaybı dâhil)
          sorumlu değiliz. Zorunlu kanuni haller saklıdır.
        </p>

        <h2>6) Sonlandırma</h2>
        <p>Koşullara aykırılık tespitinde Hizmet’e erişimi askıya alma veya sonlandırma hakkımız saklıdır.</p>

        <h2>7) Değişiklikler</h2>
        <p>Koşullar dönemsel olarak güncellenebilir. Yayımlandığı anda yürürlüğe girer; önemli değişiklikleri duyururuz.</p>

        <h2>8) Uygulanacak Hukuk ve Yetki</h2>
        <p>
          Koşullar Türkiye Cumhuriyeti hukukuna tabidir; uyuşmazlıklarda İstanbul (Merkez) mahkemeleri ve icra daireleri yetkilidir.
        </p>

        <h2>9) İletişim</h2>
        <p>
          Sanal Kahve Falı • <a href="mailto:info@kahvefalin.com">info@kahvefalin.com</a> • https://kahvefalin.com
        </p>
      </article>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </section>
  );
}
