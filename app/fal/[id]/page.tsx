import type { Metadata } from "next";
import { redis } from "@/lib/redis";

/** Yardımcılar */
function decodeId(id: string) {
  try {
    const json = Buffer.from(id, "base64").toString("utf8");
    const obj = JSON.parse(json);
    // Eski/yenİ alan adlarını normalize et
    return {
      name: String(obj.name ?? obj.n ?? "").trim(),
      gender: String(obj.gender ?? obj.g ?? "").trim(),
      age: Number(obj.age ?? obj.a ?? 0) || undefined,
      photosCount: Number(obj.photosCount ?? obj.i ?? 0) || 0,
      ts: Number(obj.t ?? Date.now()),
    };
  } catch {
    return { name: "", gender: "", age: undefined, photosCount: 0, ts: Date.now() };
  }
}

function seedRandom(seed: string) {
  // basit deterministik RNG (mulberry32 benzeri)
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, arr: T[]) {
  return arr[Math.floor(rng() * arr.length)];
}

/** Uzun yorum üretici (deterministik) */
function buildReading(seed: string, name: string, gender?: string, age?: number) {
  const rng = seedRandom(seed);

  const greet = [
    `${name ? name + "," : "Sevgili ziyaretçi,"} fincanın sakin ama yoğun bir enerji taşıyor.`,
    `${name || "Merhaba"}, telvenin çizgileri niyetinin netleştiğini gösteriyor.`,
    `${name || "Selam"}, fincanında öne çıkan semboller güçlü dönüşümleri işaret ediyor.`,
  ];

  const love = [
    "Aşk tarafında beklenmedik bir haber kapıda. İçini ferah tut; net konuştukça ilişkiler güçlenecek.",
    "Kalp bölgesinde kıvrılan çizgiler, kıskançlık veya yanlış anlaşılma riskine işaret ediyor; şeffaflıkla çözülecek.",
    "Yeni bir tanışma olasılığı beliriyor. Önce sınırlarını koru, sonra kapıyı arala.",
    "Mevcut ilişkide küçük bir kırgınlık temizleniyor; ortak plan kurmak bağları kuvvetlendirir.",
  ];

  const career = [
    "Kariyerde yön değiştirme sinyali var; ufak bir eğitim/sertifika önemli bir kapıyı açabilir.",
    "İş yerinde görünmeyen bir destekçi var; doğru zamanda doğru soruyu sor.",
    "Masada iki seçenek beliriyor; kısa vadeli rahatlık yerine orta vadeli büyümeyi seç.",
    "Üzerinde çalıştığın fikir, doğru sunumla etkisini ikiye katlayacak.",
  ];

  const money = [
    "Maddiyatta dalgalanma kısa sürüyor; gereksiz harcamaları kısınca rahatlama geliyor.",
    "Ufak bir ek gelir fırsatı görünüyor; hobi/yan iş kıvılcımları.",
    "Beklenen bir ödeme gecikse de yerine geliyor; planını bozmadan sakin kal.",
    "Birikim için net hedef koy; küçük ama istikrarlı adımlar sonuç veriyor.",
  ];

  const wellness = [
    "Uyku ve su dengesi kritik; ritmini toparlayınca enerji hızla yükselir.",
    "Kısa yürüyüşler zihnini berraklaştıracak; kararların netleşir.",
    "Eşiği aşmak için küçük hedefleri zincirle; başarının ivmesi moralini yükseltir.",
    "Ruh hâlinde dalga geçmiş; minik bir mola ve sevdiğin müzikler iyi gelir.",
  ];

  const closing = [
    "Niyetini net tut; kâinat net niyeti sever.",
    "Küçük adımların toplamı, büyük yolu açacak.",
    "Kapalı kapılar bile doğru zamanda aralanır; sabır + eylem.",
  ];

  // İçeriği bir araya getir
  const parts = [
    pick(rng, greet),
    "**Aşk & İlişkiler**: " + pick(rng, love),
    "**Kariyer & Hedefler**: " + pick(rng, career),
    "**Para & Bereket**: " + pick(rng, money),
    "**Ruh Hâli & Sağlık**: " + pick(rng, wellness),
    pick(rng, closing),
  ];

  // Yaşa/cinsiyete küçük dokunuş
  if (age && age < 25) {
    parts.splice(2, 0, "Genç bir dinamizm var; denemek istediğin alanlarda küçük pilotlar yap.");
  }
  if (gender === "kadin") {
    parts.splice(3, 0, "Kadın figürlü bir destek görünüyor; sözüne güvenilir biri yol açacak.");
  }

  return parts;
}

/** Metadata (noindex + başlık) */
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const blocked = Boolean(await redis.sismember("fal:blocked:set", id));

  const site = process.env.SITE_URL || "https://kahvefalin.com";
  const canonical = `${site}/fal/${encodeURIComponent(id)}`;

  if (blocked) {
    return {
      title: "Fal kaldırıldı",
      description: "Talep üzerine yayından kaldırılan fal sonucu.",
      robots: { index: false, follow: false },
      alternates: { canonical },
    };
  }

  // Sonuç sayfaları robots.txt ile de kapalı, burada da noindex veriyoruz
  return {
    title: "Fal Sonucu",
    description: "Sanal kahve falı sonucunuz hazır.",
    robots: { index: false, follow: false },
    alternates: { canonical },
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Engelli mi?
  const blocked = Boolean(await redis.sismember("fal:blocked:set", id));
  if (blocked) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">Bu fal kaldırıldı</h1>
        <p className="mt-3 text-neutral-600">Talep üzerine yayından kaldırılmıştır.</p>
        <a href="/" className="mt-6 inline-block rounded-lg border px-4 py-2 hover:bg-stone-50">
          Ana sayfaya dön
        </a>
      </section>
    );
  }

  const info = decodeId(id);
  const seed = `${id}-${info.name}-${info.ts}`;
  const parts = buildReading(seed, info.name || "Sevgili ziyaretçi", info.gender, info.age);

  const site = process.env.SITE_URL || "https://kahvefalin.com";
  const shareUrl = `${site}/fal/${encodeURIComponent(id)}`;
  const shareText = encodeURIComponent(`Fal sonucum: ${info.name || "Sanal Kahve Falı"}`);
  const xHref = `https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(shareUrl)}`;
  const waHref = `https://api.whatsapp.com/send?text=${encodeURIComponent(`Fal sonucum 👉 ${shareUrl}`)}`;

  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      {/* Başlık kartı */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
          <h1 className="text-xl font-semibold">
            {info.name ? `${info.name} için Fal Sonucu` : "Fal Sonucu"}
          </h1>

          <div className="flex items-center gap-2">
            <a
              href={xHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm hover:bg-stone-50"
              title="X ile paylaş"
            >
              <i className="fa-brands fa-x-twitter" /> Paylaş
            </a>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm hover:bg-stone-50"
              title="WhatsApp ile paylaş"
            >
              <i className="fa-brands fa-whatsapp" /> WhatsApp
            </a>
          </div>
        </div>

        {/* Künyeler */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-stone-600">
          {info.gender && (
            <span className="rounded-full border border-stone-200 px-3 py-1">
              {info.gender === "kadin" ? "Kadın" : info.gender === "erkek" ? "Erkek" : "Belirtmek istemiyor"}
            </span>
          )}
          {typeof info.age === "number" && info.age > 0 && (
            <span className="rounded-full border border-stone-200 px-3 py-1">{info.age} yaş</span>
          )}
          {info.photosCount ? (
            <span className="rounded-full border border-stone-200 px-3 py-1">
              {info.photosCount} fotoğraf
            </span>
          ) : null}
        </div>
      </div>

      {/* İçerik */}
      <article className="prose prose-stone mt-6 max-w-none prose-h2:mt-8 prose-p:leading-relaxed">
        {parts.map((p, i) =>
          p.startsWith("**") ? (
            <h2 key={i}>{p.replace(/\*\*/g, "")}</h2>
          ) : (
            <p key={i}>{p}</p>
          )
        )}
      </article>

      {/* Not: Sonuç sayfaları noindex — robots.ts ve metadata ile kapalı */}
      <p className="mt-8 text-center text-xs text-stone-500">
        Bu sayfa kişisel talebe bağlı olarak görüntülenir ve arama motorlarına kapalıdır.
      </p>
    </section>
  );
}
