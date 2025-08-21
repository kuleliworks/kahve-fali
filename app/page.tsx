import StepForm from "@/components/StepForm";

export default function Page() {
  // Arka planda Google’a zengin sonuç için FAQ JSON-LD
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Sanal kahve falı nedir?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Fincan fotoğraflarını yükleyerek çevrim içi yorum alma deneyimidir. Fotoğraflarını yüklersin, birkaç bilgi girersin ve sistem sana kişisel bir yorum sunar."
        }
      },
      {
        "@type": "Question",
        "name": "Kaç fotoğraf yüklemeliyim?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "En iyi sonuç için 2–3 net fotoğraf önerilir. Uygulama en fazla 3 fotoğrafa izin verir."
        }
      },
      {
        "@type": "Question",
        "name": "Çerez kullanıyor musunuz?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Form aşamasında çerez kullanılmaz. Kullanıcı deneyimini bozmadan gizliliğe öncelik veriyoruz."
        }
      }
    ]
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      {/* HERO */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-50 to-white shadow-2xl ring-1 ring-neutral-200">
        <div className="mx-auto max-w-3xl px-6 py-14 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Sanal Kahve Falı — online fal deneyimi
          </h1>
          <p className="mt-4 text-neutral-600">
            Fotoğraflarını yükle, adım adım ilerle ve modern arayüzde fal sonucunu hemen gör.
            Hızlı, güvenli ve çerezsiz.
          </p>

          {/* Reklam alanı (placeholder) */}
          <div className="mt-8 flex justify-center">
            <div className="h-24 w-full max-w-3xl rounded-xl bg-neutral-100 ring-1 ring-neutral-200 text-neutral-500 text-sm flex items-center justify-center">
              Reklam alanı (responsive) — AdSense kodun burada olacak
            </div>
          </div>

          {/* FORM */}
          <div id="form" className="mx-auto mt-10 max-w-3xl">
            <StepForm />
          </div>
        </div>
      </div>

      {/* SEO İÇERİK */}
      <div className="mx-auto mt-14 max-w-4xl">
        <article className="prose-article">
          <h2>Sanal kahve falı nedir?</h2>
          <p>
            <strong>Sanal kahve falı</strong>, fincan fotoğraflarını yükleyerek çevrim içi yorum aldığın modern bir
            deneyimdir. Klasik fal geleneğini dijital konforla buluşturur; adını ve birkaç temel bilgiyi girdikten sonra
            yorumun anında oluşturulur.
          </p>

          <h3>Nasıl çalışır?</h3>
          <ol>
            <li>Adını ve fincan/kapat fotoğraflarını yükle.</li>
            <li>Cinsiyet ve yaş bilgisini gir.</li>
            <li>İlerle ve bekleme ekranında süreci takip et.</li>
            <li>Ortalama 20–30 saniye içinde fal sonucu ekranın hazır.</li>
          </ol>

          <h3>Neden online kahve falı?</h3>
          <ul>
            <li>Hızlı ve erişilebilir—dilediğin an, dilediğin yerden.</li>
            <li>Modern arayüz—akıcı adımlar, net sonuç sayfası.</li>
            <li>Gizlilik—form sürecinde çerez kullanmıyoruz.</li>
          </ul>

          <p>
            Daha fazlasını merak ediyorsan <a href="/hakkimizda">Hakkımızda</a> sayfasına göz atabilir
            veya <a href="/blog">blog</a> yazılarımızdan rehber içeriklere ulaşabilirsin.
          </p>

          <h2>Sık sorulan sorular</h2>

          {/* Görünür SSS */}
          <div className="not-prose divide-y divide-neutral-200 overflow-hidden rounded-2xl ring-1 ring-neutral-200">
            <details className="group p-5" open>
              <summary className="flex cursor-pointer list-none items-center justify-between">
                <span className="font-medium">Sanal kahve falı nedir?</span>
                <span className="transition group-open:rotate-180">⌄</span>
              </summary>
              <div className="mt-3 text-neutral-700">
                Fincan fotoğraflarını yükleyerek çevrim içi yorum alırsın; süreç adım adım ilerler ve sonuç sayfası paylaşılabilir.
              </div>
            </details>

            <details className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between">
                <span className="font-medium">Kaç fotoğraf yüklemeliyim?</span>
                <span className="transition group-open:rotate-180">⌄</span>
              </summary>
              <div className="mt-3 text-neutral-700">
                En iyi sonuç için 2–3 fotoğraf önerilir; uygulama en fazla 3 foto kabul eder.
              </div>
            </details>

            <details className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between">
                <span className="font-medium">Çerez kullanıyor musunuz?</span>
                <span className="transition group-open:rotate-180">⌄</span>
              </summary>
              <div className="mt-3 text-neutral-700">
                Form aşamasında çerez kullanmıyoruz. Gizlilik odaklı bir akış tasarladık.
              </div>
            </details>
          </div>
        </article>
      </div>

      {/* JSON-LD (FAQ) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </section>
  );
}
