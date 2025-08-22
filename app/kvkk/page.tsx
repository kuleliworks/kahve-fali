import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni",
  description: "Kişisel verilerin korunmasına ilişkin aydınlatma metni.",
  alternates: { canonical: "/kvkk" },
  openGraph: {
    url: "/kvkk",
    title: "KVKK Aydınlatma Metni",
    description: "Kişisel verilerin korunmasına ilişkin aydınlatma metni.",
    images: [{ url: "/resim/sanal-kahve-fali-x2.png" }],
    type: "article",
  },
  twitter: {
    title: "KVKK Aydınlatma Metni",
    description: "Kişisel verilerin korunmasına ilişkin aydınlatma metni.",
    images: ["/resim/sanal-kahve-fali-x2.png"],
    card: "summary_large_image",
  },
};

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "KVKK Aydınlatma Metni",
    url: "https://kahvefalin.com/kvkk",
    inLanguage: "tr-TR",
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-center">KVKK Aydınlatma Metni</h1>
      <p className="mt-4 text-center text-stone-700">Güncelleme tarihi: 22 Ağustos 2025</p>

      <article className="prose-article mx-auto mt-8">
        <h2>1) Veri Sorumlusu ve İletişim</h2>
        <p>
          Veri sorumlusu: <strong>Sanal Kahve Falı</strong> — İstanbul, Türkiye. İletişim:{" "}
          <a href="mailto:info@kahvefalin.com">info@kahvefalin.com</a> • https://kahvefalin.com
        </p>

        <h2>2) İşleme Amaçları</h2>
        <ul>
          <li>Hizmeti sunmak; fal sonucu üretmek ve görüntülemek.</li>
          <li>Destek/iletişim süreçlerini yürütmek.</li>
          <li>Güvenlik, kötüye kullanımın önlenmesi, hata/performans izleme.</li>
          <li>Yasal yükümlülüklere uyum.</li>
        </ul>

        <h2>3) Kişisel Veri Kategorileri ve Toplama Yöntemi</h2>
        <ul>
          <li>Kimlik/iletişim: ad, e-posta (web formlarıyla elektronik ortamda).</li>
          <li>İçerik verileri: fal niyeti/mesajı ve yüklenen görseller.</li>
          <li>Teknik veriler: IP, tarayıcı/cihaz, zaman damgaları (sunucu logları).</li>
        </ul>

        <h2>4) Hukuki Sebepler</h2>
        <ul>
          <li>Sözleşmenin kurulması/ifası (KVKK m.5/2-c).</li>
          <li>Meşru menfaat (KVKK m.5/2-f).</li>
          <li>Açık rıza (opsiyonel alanlar/çerezler için gerekirse).</li>
        </ul>

        <h2>5) Aktarım</h2>
        <p>
          Hizmetin gerektirdiği ölçüde barındırma (Vercel), e-posta iletimi (SMTP sağlayıcısı) ve CDN/DNS (örn. Cloudflare)
          gibi hizmet sağlayıcılarına aktarım yapılabilir. Yurt dışına aktarım söz konusuysa KVKK’daki şartlar uygulanır.
        </p>

        <h2>6) Saklama Süreleri</h2>
        <ul>
          <li>Fal fotoğrafları/form verileri: en fazla <strong>30 gün</strong> (sonra silinir/anonimlenir).</li>
          <li>İletişim kayıtları: en fazla <strong>2 yıl</strong>.</li>
          <li>Log verileri: makul süre.</li>
        </ul>

        <h2>7) Hakların (KVKK m.11)</h2>
        <p>
          Kişisel verilerin hakkında bilgi talep etme, düzeltilmesini/silinmesini isteme, işlemeyi kısıtlama ve itiraz
          haklarına sahipsin. Başvurularını <a href="/iletisim">/iletisim</a> üzerinden veya{" "}
          <a href="mailto:info@kahvefalin.com">info@kahvefalin.com</a> adresine iletebilirsin.
        </p>

        <h2>8) Üçüncü Kişi Verileri</h2>
        <p>
          Başkalarına ait kişisel verileri bizimle paylaşmamalısın. Paylaşırsan, ilgili kişiyi bilgilendirmek ve
          gerekli yasal rızaları almak senin sorumluluğundadır.
        </p>

        <h2>9) Değişiklikler</h2>
        <p>Bu metin güncellenebilir; en güncel sürüm bu sayfada yayımlanır.</p>

        <p className="text-sm text-stone-500">
          *Örnek metindir; faaliyet süreçlerinize göre hukuk danışmanınızla uyarlayınız.
        </p>
      </article>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </section>
  );
}
