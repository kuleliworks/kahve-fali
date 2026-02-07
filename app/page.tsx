import type { Metadata } from "next";
import StepForm from "@/components/StepForm";

/** SEO: sadece sayfa adı, marka layout şablonundan gelecek */
export const metadata: Metadata = {
  // GEÇİCİ ZORLAMA: absolute kullan ve markayı ekle
  title: { absolute: "Online Kahve Falı | Sanal Kahve Falı" },
  description:
    "Sanal kahve falı ile geleceğini keşfet! Fotoğraf yükle, anında yorum al. Eğlenceli, güvenilir ve hızlı kahve falı deneyimini yaşa.",
  alternates: { canonical: "/" },
};

export default function Page() {
  // JSON-LD: FAQ ve HowTo (zengin sonuçlar)
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Sanal kahve falı nedir?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sanal kahve falı; fincan fotoğraflarını yükleyip birkaç bilgiyi girdikten sonra çevrim içi, kişiye özel bir yorum aldığın modern bir fal deneyimidir."
        }
      },
      {
        "@type": "Question",
        "name": "Online kahve falı nasıl çalışır?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Adını yazıp kahve fincanı fotoğraflarını yüklersin; cinsiyet ve yaş adımlarını geçtikten sonra yaklaşık 20–30 saniyelik ilerleme ekranı çıkar ve sonucunu paylaşılabilir bir sayfada görürsün."
        }
      },
      {
        "@type": "Question",
        "name": "Kaç fotoğraf yüklemeliyim?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "En iyi sonuç için 2–3 net fotoğraf önerilir. Uygulama en fazla 3 fotoğrafı destekler."
        }
      },
      {
        "@type": "Question",
        "name": "Çerez kullanılıyor mu?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Form akışında çerez kullanmıyoruz. Gizlilik odaklı, modern ve yalın bir süreçtir."
        }
      },
      {
        "@type": "Question",
        "name": "Sonucu paylaşabilir miyim?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Evet. Sonuç sayfası benzersiz bir bağlantı ile açılır; X, WhatsApp veya diğer platformlarda kolayca paylaşabilirsin."
        }
      }
    ]
  };

  const howtoJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "Online kahve falı gönderme adımları",
    "step": [
      { "@type": "HowToStep", "name": "Adını yaz", "text": "Formda adını gir." },
      { "@type": "HowToStep", "name": "Fotoğrafları yükle", "text": "Kahve fincanı ve kapak fotoğraflarını net şekilde yükle (en fazla 3)." },
      { "@type": "HowToStep", "name": "Cinsiyet ve yaş", "text": "Cinsiyetini ve yaşını belirt." },
      { "@type": "HowToStep", "name": "Falı başlat", "text": "20–30 saniyelik ilerleme ekranından sonra sonuç sayfası açılır." }
    ]
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      {/* HERO (sade) */}
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Sanal Kahve Falı
        </h1>
        <p className="mt-4 text-stone-700">
          Kahve fincanı fotoğraflarını yükle, adımlar arasında ilerle ve kişisel{" "}
          <strong>online kahve falı</strong> yorumunu hemen gör. Modern arayüz, hızlı deneyim ve çerezsiz akış.
        </p>
        <p className="mt-1 text-stone-700">
          Süreç ortalama 20–30 saniye sürer ve sonucu paylaşabilirsin.
        </p>
      </div>

      {/* FORM */}
      <div id="form" className="mx-auto mt-10 max-w-3xl">
        <StepForm />
      </div>

      {/* BİR BAKIŞTA — üçlü kart şerit (yan yana) */}
      <section className="mx-auto mt-16 max-w-6xl">
        <h2 className="text-center text-2xl font-semibold tracking-tight text-stone-900">
          Bir bakışta
        </h2>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Nasıl çalışır? */}
          <div className="k-card h-full">
            <div className="flex items-center gap-2 text-sm font-medium text-indigo-700">
              <i className="fa-solid fa-route"></i> Online kahve falı nasıl çalışır?
            </div>
            <ol className="k-list-check mt-3">
              <li>Adını yaz ve kahve fincanı fotoğraflarını yükle (en fazla 3).</li>
              <li>Cinsiyet ve yaş bilgisini gir.</li>
              <li>Falı başlat ve ilerleme ekranını izle (20–30 sn).</li>
              <li>Sonuç sayfası benzersiz bağlantı ile açılır; paylaş.</li>
            </ol>
          </div>

          {/* Neden Sanal Kahve Falı? */}
          <div className="k-card h-full">
            <div className="flex items-center gap-2 text-sm font-medium text-indigo-700">
              <i className="fa-solid fa-sparkles"></i> Neden Sanal Kahve Falı?
            </div>
            <ul className="k-list-check mt-3">
              <li><strong>Hızlı:</strong> Ortalama 20–30 saniyede sonuç.</li>
              <li><strong>Gizlilik:</strong> Form akışında çerez kullanılmaz.</li>
              <li><strong>Modern arayüz:</strong> Adım adım, anlaşılır deneyim.</li>
              <li><strong>Paylaşılabilir link:</strong> X, WhatsApp ve daha fazlası.</li>
              <li><strong>Mobil uyum:</strong> Kamera ile çekim desteği.</li>
            </ul>
          </div>

          {/* Fotoğraf ipuçları */}
          <div className="k-card h-full">
            <div className="flex items-center gap-2 text-sm font-medium text-indigo-700">
              <i className="fa-solid fa-camera"></i> Fotoğraf yükleme ipuçları
            </div>
            <ul className="k-list-check mt-3">
              <li>Işığı güçlü ve gölgesiz bir ortam seç.</li>
              <li>Fincanı yakın plan, net ve titremeden çek.</li>
              <li>En az bir kapak (kapat) fotoğrafı ekle.</li>
              <li>En fazla 3 fotoğraf; en iyi sonuç 2–3 net kareyle gelir.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* SSS — tek kart, alt alta açılır */}
      <section className="mx-auto mt-12 max-w-6xl">
        <div className="k-card">
          <h2 className="text-xl font-semibold tracking-tight text-stone-900">Sık sorulan sorular</h2>
          <div className="mt-4 divide-y divide-stone-200">
            <details className="group py-4" open>
              <summary className="flex cursor-pointer list-none items-center justify-between">
                <span className="font-medium">Sanal kahve falı nedir?</span>
                <span className="transition group-open:rotate-180">⌄</span>
              </summary>
              <p className="mt-3 text-stone-700">
                Fincan fotoğraflarını yükleyerek çevrim içi, kişisel bir yorum alırsın; süreç adım adım ilerler ve sonuç sayfası paylaşılabilir.
              </p>
            </details>

            <details className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between">
                <span className="font-medium">Kaç fotoğraf yüklemeliyim?</span>
                <span className="transition group-open:rotate-180">⌄</span>
              </summary>
              <p className="mt-3 text-stone-700">
                En iyi sonuç için 2–3 fotoğraf önerilir; uygulama en fazla 3 foto kabul eder.
              </p>
            </details>

            <details className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between">
                <span className="font-medium">Çerez kullanıyor musunuz?</span>
                <span className="transition group-open:rotate-180">⌄</span>
              </summary>
              <p className="mt-3 text-stone-700">
                Form aşamasında çerez kullanmıyoruz. Gizliliğe önem veriyoruz.
              </p>
            </details>

            <details className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between">
                <span className="font-medium">Sonucu nasıl paylaşırım?</span>
                <span className="transition group-open:rotate-180">⌄</span>
              </summary>
              <p className="mt-3 text-stone-700">
                Sonuç sayfasında X, WhatsApp ve Facebook için hazır butonlar var; bağlantıyı kopyalayarak da paylaşabilirsin.
              </p>
            </details>
          </div>
        </div>
      </section>

      <section class="mx-auto mt-20 max-w-6xl px-4">
  <div class="rounded-3xl border border-stone-200 bg-stone-50 p-8 shadow-sm">
    
    <h2 class="text-2xl font-semibold tracking-tight text-stone-900">
      Sanal Kahve Falı Nedir?
    </h2>

    <p class="mt-4 text-stone-700 leading-relaxed">
      <strong>Sanal kahve falı</strong>, geleneksel kahve falı deneyiminin modern teknolojiyle
      çevrim içi ortama taşınmış halidir. Kahve fincanı ve kapak fotoğraflarını yükleyerek,
      herhangi bir falcıya gitmeden <strong>online kahve falı</strong> yorumu alabilirsin.
      Bu yöntem, özellikle hızlı ve pratik bir fal deneyimi arayanlar için tercih edilir.
    </p>

    <p class="mt-3 text-stone-700 leading-relaxed">
      Kahvefalin.com’da sunulan sistem, adım adım ilerleyen bir akışla çalışır.
      Fotoğraflar analiz edilir, yorum süreci başlatılır ve sonuç
      <strong>kişiye özel bir bağlantı</strong> üzerinden görüntülenir.
      Böylece klasik “kahve falı bak” deneyimi dijital dünyada yeniden yorumlanır.
    </p>

    <h3 class="mt-8 text-xl font-semibold tracking-tight text-stone-900">
      Online Kahve Falı Nasıl Bakılır?
    </h3>

    <p class="mt-3 text-stone-700 leading-relaxed">
      Online kahve falı bakmak için öncelikle kahveni içip fincanını kapatman yeterlidir.
      Ardından fincanın içi ve kapak kısmının net fotoğraflarını çekerek sisteme yüklersin.
      Girilen yaş ve cinsiyet bilgileriyle birlikte yorum süreci başlar ve ortalama
      <strong>20–30 saniye</strong> içinde fal sonucu hazırlanır.
    </p>

    <p class="mt-3 text-stone-700 leading-relaxed">
      Bu yöntem, zamandan tasarruf sağlarken aynı zamanda
      <strong>gizliliğe önem veren</strong> bir fal deneyimi sunar.
      Kullanıcılar, sonuçlarını isterlerse sosyal medya veya mesajlaşma uygulamaları
      üzerinden paylaşabilir.
    </p>

    <h3 class="mt-8 text-xl font-semibold tracking-tight text-stone-900">
      Neden Sanal Kahve Falı Tercih Ediliyor?
    </h3>

    <ul class="mt-4 list-disc space-y-2 pl-5 text-stone-700">
      <li>Her yerden ve her zaman online kahve falı bakılabilmesi</li>
      <li>Fiziksel falcıya gitme zorunluluğunun olmaması</li>
      <li>Hızlı sonuç ve modern kullanıcı deneyimi</li>
      <li>Paylaşılabilir ve saklanabilir fal sonuçları</li>
      <li>Mobil uyumlu, kolay kullanılabilir arayüz</li>
    </ul>

    <p class="mt-6 text-stone-700 leading-relaxed">
      Eğer sen de kahve falını geleneksel yöntemlerin dışına taşıyarak
      dijital dünyada deneyimlemek istiyorsan,
      <strong>sanal kahve falı</strong> tam sana göre.
      Kahvefalin.com ile falını hemen gönder, sonucu anında gör.
    </p>

  </div>
</section>


      {/* JSON-LD blokları */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howtoJsonLd) }} />
    </section>
  );
}
