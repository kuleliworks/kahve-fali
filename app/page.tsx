import type { Metadata } from "next";
import StepForm from "@/components/StepForm";
import Link from "next/link";

/** SEO: sadece sayfa adı, marka layout şablonundan gelecek */
export const metadata: Metadata = {
  title: { absolute: "Online Kahve Falı | Sanal Kahve Falı Bak" },
  description:
    "Sanal kahve falı ile geleceğini keşfet! Fotoğraf yükle, anında yorum al. Eğlenceli, güvenilir ve hızlı kahve falı deneyimini yaşa. %100 ücretsiz kahve falı servisi.",
  keywords: ["kahve falı", "online kahve falı", "sanal fal", "kahve fincanı falı", "fal baktır", "ücretsiz fal"],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Online Kahve Falı - Anında Fal Yorumu",
    description: "Kahve falına mı baktırmak istiyorsun? Hemen fotoğrafını yükle, kişisel fal yorumunu anında al!",
    type: "website",
    locale: "tr_TR",
  },
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

  // Site WebPage Schema - EKLENDİ
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Online Kahve Falı",
    "url": "https://kahvefalin.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://kahvefalin.com/ara?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      {/* HERO (CTA ve arama motoru dostu başlık) */}
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Online Kahve Falı: Fotoğrafını Yükle, <span className="text-indigo-600">Anında Falını Gör</span>
        </h1>
        <p className="mt-4 text-stone-700">
          <strong>Kahve falı baktırmak</strong> artık çok kolay! Sadece kahve fincanı fotoğraflarını yükle, adımlar arasında ilerle ve kişisel{" "}
          <strong>online kahve falı</strong> yorumunu hemen gör. Modern arayüz, hızlı deneyim ve gizlilik odaklı akış.
        </p>
        <p className="mt-1 text-stone-700">
          <strong>%100 ücretsiz</strong> - Ortalama 20–30 saniyede sonuç alırsın ve falını arkadaşlarınla paylaşabilirsin.
        </p>
        
        {/* CTA Buton - EKLENDİ */}
        <div className="mt-8">
          <a 
            href="#form" 
            className="inline-flex items-center rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
          >
            <i className="fa-solid fa-mug-hot mr-2"></i>
            HEMEN FALINA BAK
          </a>
        </div>
      </div>

      {/* FORM */}
      <div id="form" className="mx-auto mt-10 max-w-3xl">
        <StepForm />
      </div>

      {/* BİR BAKIŞTA — üçlü kart şerit (yan yana) */}
      <section className="mx-auto mt-16 max-w-6xl">
        <h2 className="text-center text-2xl font-semibold tracking-tight text-stone-900">
          Sanal Kahve Falı Nasıl Çalışır?
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

      {/* KAPSAMLI REHBER BÖLÜMÜ - EKLENDİ */}
      <section className="mx-auto mt-16 max-w-6xl">
        <div className="bg-gradient-to-r from-indigo-50 to-white rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-stone-900 mb-6">
            Kahve Falı Hakkında Her Şey
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-indigo-700 mb-4">
                <i className="fa-solid fa-book mr-2"></i>Kahve Falı Nedir?
              </h3>
              <p className="text-stone-700 mb-4">
                Kahve falı, Türk kültüründe köklü bir geçmişi olan geleneksel bir fal türüdür. 
                Kahve fincanında kalan telvelerin oluşturduğu şekiller yorumlanarak geleceğe 
                dair ipuçları elde edilir. Sanal kahve falı ise bu geleneği dijital ortama taşıyarak 
                herkesin kolayca erişebileceği modern bir formata dönüştürmüştür.
              </p>
              
              <h3 className="text-xl font-semibold text-indigo-700 mb-4 mt-6">
                <i className="fa-solid fa-star mr-2"></i>Neden Online Kahve Falı?
              </h3>
              <ul className="list-disc pl-5 text-stone-700 space-y-2">
                <li>Anında sonuç alırsınız (20-30 saniye)</li>
                <li>Evden çıkmadan fal baktırabilirsiniz</li>
                <li>Gizliliğiniz korunur</li>
                <li>Sonuçlarınızı paylaşabilirsiniz</li>
                <li>7/24 erişilebilir</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-indigo-700 mb-4">
                <i className="fa-solid fa-lightbulb mr-2"></i>İpuçları ve Tavsiyeler
              </h3>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="font-medium text-stone-900 mb-2">Fal Sonuçlarını Yorumlama</h4>
                  <p className="text-sm text-stone-600">
                    Aldığınız fal yorumunu pozitif bir şekilde değerlendirin. 
                    Kahve falı geleceği kesin olarak göstermez, ancak hayatınıza 
                    farklı bir perspektiften bakmanıza yardımcı olabilir.
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="font-medium text-stone-900 mb-2">En İyi Fotoğraf Çekimi</h4>
                  <p className="text-sm text-stone-600">
                    Doğal ışıkta çekim yapın, fincanın içini net gösterin. 
                    Parlamaları önlemek için açıyı iyi ayarlayın. 
                    En az 2 farklı açıdan fotoğraf çekmeye özen gösterin.
                  </p>
                </div>
              </div>
              
              {/* Blog Linkleri - EKLENDİ */}
              <div className="mt-8">
                <h4 className="font-semibold text-lg text-stone-900 mb-4">
                  Kahve Falı Blog Yazılarımız
                </h4>
                <div className="space-y-3">
                  <Link href="/blog/kahve-fali-nasil-bakilir" className="block text-indigo-600 hover:text-indigo-800 hover:underline">
                    <i className="fa-solid fa-chevron-right mr-2 text-xs"></i>
                    Kahve Falı Nasıl Bakılır? Detaylı Rehber
                  </Link>
                  <Link href="/blog/fincan-sekilleri-anlamlari" className="block text-indigo-600 hover:text-indigo-800 hover:underline">
                    <i className="fa-solid fa-chevron-right mr-2 text-xs"></i>
                    Fincanda Görülen Şekiller ve Anlamları
                  </Link>
                  <Link href="/blog/kahve-fali-tarihce" className="block text-indigo-600 hover:text-indigo-800 hover:underline">
                    <i className="fa-solid fa-chevron-right mr-2 text-xs"></i>
                    Kahve Falının Tarihçesi ve Kültürümüzdeki Yeri
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SSS — tek kart, alt alta açılır */}
      <section className="mx-auto mt-12 max-w-6xl">
        <div className="k-card">
          <h2 className="text-xl font-semibold tracking-tight text-stone-900">Sık Sorulan Sorular</h2>
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

      {/* GÜVEN BADGELERİ - EKLENDİ */}
      <section className="mx-auto mt-12 max-w-3xl text-center">
        <h3 className="text-lg font-medium text-stone-700 mb-6">
          <i className="fa-solid fa-shield-check mr-2 text-green-600"></i>
          Güvenle Kullanın
        </h3>
        <div className="flex flex-wrap justify-center gap-6">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-lock text-green-600"></i>
            <span className="text-sm">Güvenli Bağlantı (HTTPS)</span>
          </div>
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-user-shield text-green-600"></i>
            <span className="text-sm">Gizlilik Korunur</span>
          </div>
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-rocket text-green-600"></i>
            <span className="text-sm">Hızlı Yükleme</span>
          </div>
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-mobile-screen text-green-600"></i>
            <span className="text-sm">Mobil Uyumlu</span>
          </div>
        </div>
      </section>

      {/* JSON-LD blokları */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howtoJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
    </section>
  );
}
