import type { Metadata } from "next";
import { redis } from "@/lib/redis";

/** ID çözümleyici (eski/yeni alanları normalize eder) */
function decodeId(id: string) {
  try {
    const json = Buffer.from(id, "base64").toString("utf8");
    const obj = JSON.parse(json);
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

/** Basit deterministik RNG */
function seedRandom(seed: string) {
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
const pick = <T,>(rng: () => number, arr: T[]) => arr[Math.floor(rng() * arr.length)];

/** Uzun yorum (deterministik) */
function buildReading(seed: string, name: string, gender?: string, age?: number) {
  const rng = seedRandom(seed);

  const hello = [
    `${name ? `${name},` : "Sevgili ziyaretçi,"} fincanındaki izler hem toparlanmayı hem de yeni başlangıçları fısıldıyor.`,
    `${name || "Merhaba"}, telvenin akışı niyetinin netleştiğini ve yoluna eşlik eden saklı fırsatları gösteriyor.`,
    `${name || "Selam"}, semboller dengeli bir dönüşümün eşiğinde olduğunu söylüyor.`,
  ];

  const themes = {
    love: [
      "Aşk tarafında duyguları açık ifade ettiğinde yanlış anlaşılmalar hızla çözülüyor.",
      "Kalp bölgesinde kıvrımlar var; kıskançlığa kapı aralamadan sınırlarını şefkatle hatırlat.",
      "Yeni bir tanışma olasılığı beliriyor; adımların net oldukça bağ güçlenecek.",
      "Geçmişten gelen küçük bir kırgınlığı onarmak, kalbine şaşırtıcı bir ferahlık getirecek.",
      "Kararını aceleye getirme; konuşmalar olgunlaştıkça güven derinleşecek.",
    ],
    career: [
      "İş tarafında bir fikir olgunlaşıyor; küçük bir POC/sunum etkisini ikiye katlayabilir.",
      "Görünmeyen bir destekçi var; doğru zamanda yönlendirici bir cümle duyacaksın.",
      "İki seçenek masada: kısa vadeli konfor yerine orta vadeli büyümeyi seçmek bereketi artırır.",
      "Yetkinliklerini vitrine çıkaran küçük bir sertifika/mini eğitim kritik kapı açar.",
      "Takım içinde rol netliği kurduğunda sorumlulukların daha zevkli bir akışa girer.",
    ],
    money: [
      "Maddiyatta kısa bir dalga geçiyor; planını bozmadan israfı kıstığında dengeye oturuyor.",
      "Yan gelir potansiyeli var; hobi/uzmanlıklarını mikro hizmete çevirmek mümkün.",
      "Bekleyen bir ödeme gecikse de yerine geliyor; sabır + plan, stresi azaltır.",
      "Net tasarruf hedefi koyduğunda küçük adımların çarpan etkisi oluşur.",
    ],
    wellness: [
      "Uyku ve su dengesini toparlayınca enerjin hızla yükseliyor; kararların netleşir.",
      "Kısa yürüyüş ve nefes pratiği zihnini berraklaştırır; odak dağınıklığı azalır.",
      "Ruh hâlinde iniş çıkış olmuş; minik bir mola ve sevdiğin müzik iyi gelir.",
      "Ekran molaları ve esneme, gün sonu yorgunluğunu belirgin azaltır.",
    ],
    social: [
      "Yakın çevrede yanlış anlaşılma riskini net cümlelerle kapat; açık iletişim kilit.",
      "Görüşmediğin biriyle temas tazelenebilir; küçük bir mesaj buzları çözer.",
      "Yeni bir topluluk/ortam, ufkunu genişletecek bağlantılar getirebilir.",
    ],
    opportunities: [
      "Zamanlaması iyi bir adım, beklediğinden büyük kapılar açar; iç sesini dinle.",
      "Bir davet/fırsat ufukta; hazırlığını erken tamamlamak özgüvenini artırır.",
      "Esneyen planlar, sürpriz gelişmelerden güç devşirmeni sağlar.",
    ],
    closing: [
      "Niyetini net tut; evren net niyeti sever.",
      "Küçük ama istikrarlı adımlar, büyük yolu açar.",
      "Kapalı kapılar doğru zamanda aralanır; sabır + eylem.",
    ],
  };

  const parts: string[] = [
    pick(rng, hello),
    "## Aşk & İlişkiler",
    pick(rng, themes.love),
    pick(rng, themes.love),
    "## Kariyer & Hedefler",
    pick(rng, themes.career),
    pick(rng, themes.career),
    "## Para & Bereket",
    pick(rng, themes.money),
    pick(rng, themes.money),
    "## Ruh Hâli & Sağlık",
    pick(rng, themes.wellness),
    pick(rng, themes.wellness),
    "## Sosyal & Çevre",
    pick(rng, themes.social),
    "## Fırsatlar",
    pick(rng, themes.opportunities),
    pick(rng, themes.opportunities),
    pick(rng, themes.closing),
  ];

  if (typeof age === "number" && age > 0 && age < 26) {
    parts.splice(6, 0, "Öğrenme eğrisi sende hızlı; küçük pilot denemeler güvenli ilerleme sağlar.");
  }
  if (gender === "kadin") {
    parts.splice(9, 0, "Kadın figürlü bir destek görünüyor; sözüne güvenilir biri kapı aralayacak.");
  }

  return parts;
}

/** Metadata (noindex; layout şablonu otomatik '%s | Sanal Kahve Falı') */
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
      openGraph: { url: canonical, title: "Fal kaldırıldı", description: "Talep üzerine kaldırıldı." },
      twitter: { card: "summary", title: "Fal kaldırıldı", description: "Talep üzerine kaldırıldı." },
    };
  }
  return {
    title: "Fal Sonucu",
    description: "Sanal kahve falı sonucunuz hazır.",
    robots: { index: false, follow: false },
    alternates: { canonical },
    openGraph: { url: canonical, title: "Fal Sonucu", description: "Sanal kahve falı sonucunuz hazır." },
    twitter: { card: "summary", title: "Fal Sonucu", description: "Sanal kahve falı sonucunuz hazır." },
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Engelli ise "kaldırıldı" ekranı
  const blocked = Boolean(await redis.sismember("fal:blocked:set", id));
  if (blocked) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">Bu fal kaldırıldı</h1>
        <p className="mt-3 text-neutral-600">Talep üzerine yayından kaldırılmıştır.</p>
        <a href="/" className="mt-6 inline-block rounded-lg border px-4 py-2 hover:bg-stone-50">Ana sayfaya dön</a>
      </section>
    );
  }

  const info = decodeId(id);
  const seed = `${id}-${info.name}-${info.ts}`;
  const content = buildReading(seed, info.name || "Sevgili ziyaretçi", info.gender, info.age);

  const site = process.env.SITE_URL || "https://kahvefalin.com";
  const shareUrl = `${site}/fal/${encodeURIComponent(id)}`;
  const shareText = encodeURIComponent(`Fal sonucum: ${info.name || "Sanal Kahve Falı"}`);
  const xHref = `https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(shareUrl)}`;
  const waHref = `https://api.whatsapp.com/send?text=${encodeURIComponent(`Fal sonucum 👉 ${shareUrl}`)}`;

  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
          <h1 className="text-xl font-semibold">
            {info.name ? `${info.name} için Fal Sonucu` : "Fal Sonucu"}
          </h1>
          <div className="flex items-center gap-2">
            <a href={xHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm hover:bg-stone-50" title="X ile paylaş">
              <i className="fa-brands fa-x-twitter" /> Paylaş
            </a>
            <a href={waHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm hover:bg-stone-50" title="WhatsApp ile paylaş">
              <i className="fa-brands fa-whatsapp" /> WhatsApp
            </a>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-stone-600">
          {info.gender && <span className="rounded-full border border-stone-200 px-3 py-1">
            {info.gender === "kadin" ? "Kadın" : info.gender === "erkek" ? "Erkek" : "Belirtmek istemiyor"}
          </span>}
          {typeof info.age === "number" && info.age > 0 && <span className="rounded-full border border-stone-200 px-3 py-1">{info.age} yaş</span>}
          {info.photosCount ? <span className="rounded-full border border-stone-200 px-3 py-1">{info.photosCount} fotoğraf</span> : null}
        </div>
      </div>

      <article className="prose prose-stone mt-6 max-w-none prose-h2:mt-8 prose-p:leading-relaxed">
        {content.map((p, i) =>
          p.startsWith("## ") ? <h2 key={i}>{p.replace(/^##\s+/,"")}</h2> : <p key={i}>{p}</p>
        )}
      </article>

      <p className="mt-8 text-center text-xs text-stone-500">
        Bu sayfa kişisel talebe bağlı olarak görüntülenir ve arama motorlarına kapalıdır.
      </p>
    </section>
  );
}
