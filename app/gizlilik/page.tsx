import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gizlilik Politikası — Sanal Kahve Falı",
  description:
    "Sanal Kahve Falı (kahvefalin.com) gizlilik politikası: toplanan veriler, işleme amaçları, saklama süreleri, aktarım ve haklar.",
  alternates: { canonical: "/gizlilik" },
};

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Gizlilik Politikası",
    url: "https://kahvefalin.com/gizlilik",
    inLanguage: "tr-TR",
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-center">Gizlilik Politikası</h1>
      <p className="mt-4 text-center text-stone-700">Güncelleme tarihi: 22 Ağustos 2025</p>

      <article className="prose-article mx-auto mt-8">
        <h2>1) Kapsam ve Veri Sorumlusu</h2>
        <p>
          Bu metin, <strong>Sanal Kahve Falı</strong> hizmetinin (“Hizmet”) işletildiği{" "}
          <strong>https://kahvefalin.com</strong> alan adı için kişisel verilerin işlenmesine ilişkindir.
          Veri sorumlusu: <strong>Sanal Kahve Falı</strong> — İstanbul, Türkiye. İletişim:{" "}
          <a href="mailto:info@kahvefalin.com">info@kahvefalin.com</a>.
        </p>

        <h2>2) İşlediğimiz Veri Kategorileri</h2>
        <ul>
          <li>
            <strong>Fal formu verileri:</strong> ad, cinsiyet, yaş, gönüllü bıraktığın not/niyet ve yüklediğin kahve
            fincanı fotoğrafları (en fazla 3).
          </li>
          <li>
            <strong>İletişim formu verileri:</strong> ad-soyad, e-posta, konu, mesaj.
          </li>
          <li>
            <strong>Teknik günlük verileri:</strong> IP, tarayıcı/cihaz bilgisi, zaman damgaları ve hata günlükleri
            (güvenlik ve performans için sınırlı olarak).
          </li>
        </ul>

        <h2>3) İşleme Amaçları</h2>
        <ul>
          <li>Hizmeti sunmak; fal sonucunu üretmek ve paylaşılabilir sayfa göstermek.</li>
          <li>İletişim taleplerini karşılamak ve destek vermek.</li>
          <li>Güvenlik, kötüye kullanımın önlenmesi, hata/performans izleme.</li>
          <li>Yasal yükümlülüklere uyum ve taleplere yanıt.</li>
        </ul>

        <h2>4) Hukuki Sebepler</h2>
        <ul>
          <li>Hizmetin kurulması/ifası (KVKK m.5/2-c; GDPR m.6/1-b eşdeğeri).</li>
          <li>Meşru menfaat (güvenlik, dolandırıcılığın önlenmesi) (KVKK m.5/2-f).</li>
          <li>Açık rıza (opsiyonel tercihler/iletişim varsa).</li>
        </ul>

        <h2>5) Çerezler</h2>
        <p>
          <strong>Fal formu akışında çerez kullanmıyoruz.</strong> Site genelinde yalnızca zorunlu çerezler
          (oturum/güvenlik) çalışabilir. Analitik/Reklam çerezleri varsayılan olarak kapalıdır; eklenirse
          açık rıza ve tercih yönetimi sağlanacaktır (ör. Google Analytics/AdSense gibi üçüncü taraflar).
        </p>

        <h2>6) Saklama Süreleri</h2>
        <ul>
          <li>Fal fotoğrafları ve form verileri: işlemin tamamlanması + kalite kontrol için <strong>en fazla 30 gün</strong> (sonrasında silinir/anonimlenir).</li>
          <li>İletişim kayıtları: yasal yükümlülükler ve operasyonel gereklilikler için <strong>en fazla 2 yıl</strong>.</li>
          <li>Güvenlik/hata logları: sınırlı süre, makul ölçülerde.</li>
        </ul>

        <h2>7) Aktarım / Altyapı</h2>
        <ul>
          <li>Barındırma ve dağıtım: Vercel Inc. (AB dışına aktarım söz konusuysa uygun koruma tedbirleri uygulanır).</li>
          <li>E-posta gönderimi: SMTP sağlayıcısı (ör. Spacemail) ve e-posta iletim altyapısı.</li>
          <li>CDN/DNS/Firewall: Cloudflare (varsa).</li>
          <li>Analitik/Reklam: Yalnızca açık rıza verilirse (ileride eklenebilir).</li>
        </ul>

        <h2>8) Hakların</h2>
        <p>
          KVKK m.11’deki haklarını (erişim, düzeltme, silme, işlemeyi kısıtlama vb.){" "}
          <a href="/iletisim">İletişim</a> sayfası veya{" "}
          <a href="mailto:info@kahvefalin.com">info@kahvefalin.com</a> üzerinden kullanabilirsin.
        </p>

        <h2>9) Güvenlik</h2>
        <p>
          Veriler uygun idari ve teknik tedbirlerle korunur. İnternet tabanlı iletimde mutlak güvenlik garanti edilemez;
          şüpheli bir durum fark edersen bize bildir.
        </p>

        <h2>10) Değişiklikler</h2>
        <p>
          Bu politika zaman zaman güncellenebilir. Önemli değişiklikler makul ölçüde duyurulacaktır. En güncel sürüm
          her zaman bu sayfada yer alır.
        </p>

        <h2>11) İletişim</h2>
        <p>
          Sanal Kahve Falı • İstanbul, Türkiye •{" "}
          <a href="mailto:info@kahvefalin.com">info@kahvefalin.com</a>
        </p>

        <p className="text-sm text-stone-500">
          *Bu metin genel bilgilendirme amaçlıdır; faaliyetlerinize göre hukuki danışmanınızla özelleştiriniz.
        </p>
      </article>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </section>
  );
}
