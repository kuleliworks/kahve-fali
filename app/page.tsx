import StepForm from "@/components/StepForm";

export default function Page() {
  // JSON-LD: FAQ ve HowTo (zengin sonuçlar için)
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

      {/* İÇİNDEKİLER */}
      <nav className="mx-auto mt-14 max-w-5xl">
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-stone-600">
            <li><a href="#nedir" className="hover:underline">Sanal kahve falı nedir?</a></li>
            <li><a href="#nasil" className="hover:underline">Nasıl çalışır?</a></li>
            <li><a href="#neden" className="hover:underline">Neden Kahvefalin?</a></li>
            <li><a href="#ipuclari" className="hover:underline">Fotoğraf ipuçları</a></li>
            <li><a href="#sss" className="hover:underline">Sık sorulan sorular</a></li>
          </ul>
        </div>
      </nav>

      {/* SEO BÖLÜMÜ — iki sütun + kartlar + desenli arka plan */}
      <div className="mx-auto mt-10 max-w-6xl">
        <div className="section-muted grid-bg p-6 sm:p-10">
          <div className="grid gap-10 lg:grid-cols-[1fr,320px]">
            {/* SOL: İçerik */}
            <article className="prose-article">
              <h2 id="nedir">Sanal kahve falı nedir?</h2>
              <p>
                <strong>Sanal kahve falı</strong>, fincan ve kapak fotoğraflarını yükleyerek çevrim içi yorum aldığın modern bir deneyimdir.
                Klasik geleneği dijital konforla buluşturur; adını ve birkaç temel bilgiyi girdikten sonra yorumun otomatik üretilir.
              </p>

              <div className="k-note">
                <span className="k-badge"><i className="fa-solid fa-shield"></i> Gizlilik</span>
                <p className="mt-2 text-sm text-stone-700">
                  Form akışında çerez kullanmıyoruz. Yükleme, adım geçişleri ve sonuç sayfası gizlilik odaklı tasarlandı.
                </p>
              </div>

              <div className="k-divider" />

              <h2 id="nasil">Online kahve falı nasıl çalışır?</h2>
              <ol className="k-list-check">
                <li><strong>Adını yaz</strong> ve kahve fincanı fotoğraflarını yükle (en fazla 3).</li>
                <li><strong>Cinsiyet</strong> ve <strong>yaş</strong> bilgisini gir.</li>
                <li><strong>Falı başlat</strong> ve ilerleme ekranını izle (20–30 sn).</li>
                <li><strong>Sonuç sayfası</strong> benzersiz bağlantı ile açılır; arkadaşlarınla paylaşabilirsin.</li>
              </ol>

              <div className="k-divider" />

              <h2 id="neden">Neden Kahvefalin?</h2>
              <ul className="k-list-check">
                <li><strong>Hızlı:</strong> Ortalama 20–30 saniyede sonuç.</li>
                <li><strong>Gizlilik:</strong> Form akışında çerez kullanılmaz.</li>
                <li><strong>Modern arayüz:</strong> Adım adım ilerleyen sade ve anlaşılır deneyim.</li>
                <li><strong>Paylaşılabilir link:</strong> Sonucu X, WhatsApp ve daha fazlasında paylaş.</li>
                <li><strong>Mobil uyum:</strong> Kamera ile fotoğraf çekip yükleme desteği.</li>
              </ul>

              <div className="k-divider" />

              <h2 id="ipuclari">Fotoğraf yükleme ipuçları</h2>
              <ul className="k-list-check">
                <li>Işığı güçlü ve gölgesiz bir ortam seç.</li>
                <li>Fincanı yakın plan, net ve titremeden çek.</li>
                <li>En az bir kapak (kapat) fotoğrafı ekle.</li>
                <li>En fazla 3 fotoğraf; en iyi sonuç genelde 2–3 net kareyle gelir.</li>
              </ul>

              <div className="k-divider" />

              <h2 id="sss">Sık sorulan sorular</h2>
              <div className="not-prose divide-y divide-stone-200 overflow-hidden rounded-2xl ring-1 ring-stone-200 bg-white">
                <details className="group p-5" open>
                  <summary className="flex cursor-pointer list-none items-center justify-between">
                    <span className="font-medium">Sanal kahve falı nedir?</span>
                    <span className="transition group-open:rotate-180">⌄</span>
                  </summary>
                  <div className="mt-3 text-stone-700">
                    Fincan fotoğraflarını yükleyerek çevrim içi, kişisel bir yorum alırsın; süreç adım adım ilerler ve sonuç sayfası paylaşılabilir.
                  </div>
                </details>

                <details className="group p-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between">
                    <span className="font-medium">Kaç fotoğraf yüklemeliyim?</span>
                    <span className="transition group-open:rotate-180">⌄</span>
                  </summary>
                  <div className="mt-3 text-stone-700">
                    En iyi sonuç için 2–3 fotoğraf önerilir; uygulama en fazla 3 foto kabul eder.
                  </div>
                </details>

                <details className="group p-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between">
                    <span className="font-medium">Çerez kullanıyor musunuz?</span>
                    <span className="transition group-open:rotate-180">⌄</span>
                  </summary>
                  <div className="mt-3 text-stone-700">
                    Form aşamasında çerez kullanmıyoruz. Gizliliğe önem veriyoruz.
                  </div>
                </details>

                <details className="group p-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between">
                    <span className="font-medium">Sonucu nasıl paylaşırım?</span>
                    <span className="transition group-open:rotate-180">⌄</span>
                  </summary>
                  <div className="mt-3 text-stone-700">
                    Sonuç sayfasında X, WhatsApp ve Facebook için hazır butonlar bulunur; bağlantıyı kopyalayarak da paylaşabilirsin.
                  </div>
                </details>

                <details className="group p-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between">
                    <span className="font-medium">Mobil cihazdan fotoğraf çekebilir miyim?</span>
                    <span className="transition group-open:rotate-180">⌄</span>
                  </summary>
                  <div className="mt-3 text-stone-700">
                    Evet. Dosya alanı kamera ile çekime açıktır; destekleyen tarayıcılarda doğrudan kamera açılır.
                  </div>
                </details>
              </div>

              <p className="mt-8">
                Daha fazla rehber için <a href="/blog">blog</a> sayfamıza göz atabilir, soruların için <a href="/iletisim">iletişim</a> formunu kullanabilirsin.
              </p>
            </article>

            {/* SAĞ: destekleyici kartlar */}
            <aside className="space-y-4">
              <div className="k-card">
                <span className="k-badge"><i className="fa-solid fa-bolt"></i> Hızlı sonuç</span>
                <p className="mt-3 text-sm text-stone-700">
                  Ortalama <strong>20–30 saniye</strong> içinde kişisel fal yorumunu gör.
                </p>
              </div>

              <div className="k-card">
                <span className="k-badge"><i className="fa-solid fa-link"></i> Paylaşılabilir link</span>
                <p className="mt-3 text-sm text-stone-700">
                  Sonucun benzersiz bağlantı ile açılır; X, WhatsApp ve Facebook’ta paylaş.
                </p>
              </div>

              <div className="k-card">
                <span className="k-badge"><i className="fa-solid fa-mobile-screen"></i> Mobil uyum</span>
                <p className="mt-3 text-sm text-stone-700">
                  Kamera ile çekim desteği—destekleyen tarayıcılarda doğrudan kamerayı aç.
                </p>
              </div>

              <a href="#form" className="k-card text-center hover:shadow-lg transition">
                <div className="text-sm text-stone-600">Hazır mısın?</div>
                <div className="mt-1 font-semibold">Falını hemen gönder</div>
              </a>
            </aside>
          </div>
        </div>
      </div>

      {/* JSON-LD blokları */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howtoJsonLd) }} />
    </section>
  );
}
