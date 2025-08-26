"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BlogImageUpload from "@/components/BlogImageUpload";

/** TR karakterleri normalize edip güvenli slug üretir */
function slugifyTr(input: string) {
  const map: Record<string, string> = {
    ç: "c", ğ: "g", ı: "i", i: "i", İ: "i", ö: "o", ş: "s", ü: "u",
    Ç: "c", Ğ: "g", I: "i", Ö: "o", Ş: "s", Ü: "u",
  };
  const norm = input
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("");
  return norm
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type PostDraft = {
  title: string;
  slug: string;
  description: string;
  content: string; // HTML veya düz yazı
  status: "draft" | "pub";
  image?: string;
};

export default function NewPostClient() {
  const router = useRouter();
  const sp = useSearchParams();

  // ?title= ve ?slug= ile ön-doldurma (opsiyonel)
  const initTitle = sp.get("title") || "";
  const initSlug = sp.get("slug") || "";

  const [d, setD] = useState<PostDraft>({
    title: initTitle,
    slug: initSlug ? slugifyTr(initSlug) : "",
    description: "",
    content: "",
    status: "pub",
    image: undefined,
  });

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Başlıktan otomatik slug öner
  const suggestedSlug = useMemo(() => (d.title ? slugifyTr(d.title) : ""), [d.title]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;

    setErr(null);
    setMsg(null);
    setSaving(true);

    try {
      // Zorunlu alanlar
      const title = d.title.trim();
      const slug = (d.slug || suggestedSlug).trim();
      const description = d.description.trim();
      const content = d.content.trim();
      const status = d.status;

      if (!title || !slug || !description || !content) {
        throw new Error("Zorunlu alanlar: Başlık, Slug, Açıklama, İçerik");
      }

      // **DİKKAT**: Timeoutsız, AbortControllersız — tarayıcı abort etmesin
      const res = await fetch("/api/blog/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        keepalive: true, // sayfa yenilense bile mümkünse tamamlasın
        body: JSON.stringify({
          title,
          slug,
          description,
          content,
          status,
          image: d.image,
        }),
      });

      const raw = await res.text(); // Yanıt JSON değilse okunabilir hata verelim
      let json: any;
      try {
        json = JSON.parse(raw);
      } catch {
        throw new Error(`Geçersiz yanıt: ${raw.slice(0, 200)}`);
      }

      if (!res.ok || !json?.ok) {
        // 409 -> mükerrer slug
        if (res.status === 409) {
          throw new Error("Bu bağlantı (slug) zaten kullanılıyor. Lütfen farklı bir slug deneyin.");
        }
        throw new Error(json?.error || `İstek başarısız (HTTP ${res.status})`);
      }

      setMsg("İçerik kaydedildi.");
      // Uyarı + seçenek: Görüntüle / Yeni yazı
      const go = confirm("İçerik kaydedildi. Yazıyı görüntülemek ister misiniz?");
      if (go) {
        router.push(`/blog/${encodeURIComponent(json.slug)}`);
      } else {
        // Formu sıfırla, aynı sayfada kal
        setD({
          title: "",
          slug: "",
          description: "",
          content: "",
          status: "pub",
          image: undefined,
        });
        // router.refresh(); // istersen listeyi tazelemek için /panel/blog sayfasında kullan
      }
    } catch (e: any) {
      // **En önemli yer**: Abort kaynaklı hataları da yakala
      const msg =
        e?.name === "AbortError"
          ? "İstek iptal edildi (ağ geçici olarak koptu ya da sayfa değişti). Tekrar deneyin."
          : e?.message || "Bilinmeyen bir hata oluştu.";
      setErr(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Yeni Blog Yazısı</h1>
      <p className="mt-2 text-sm text-stone-600">
        Zorunlu: Başlık, Slug, Açıklama, İçerik. Durum “Yayınla” ise /blog listesine düşer.
      </p>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium">Başlık</label>
          <input
            className="input mt-1"
            placeholder="Örn: Kahve Falında Yılan Görmek"
            value={d.title}
            onChange={(e) => setD({ ...d, title: e.target.value })}
          />
          {d.title && (
            <div className="mt-1 text-xs text-stone-500">
              Önerilen slug: <code>{suggestedSlug}</code>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Slug (bağlantı)</label>
          <input
            className="input mt-1"
            placeholder="ornegin-kahve-falinda-yilan-gormek"
            value={d.slug}
            onChange={(e) => setD({ ...d, slug: slugifyTr(e.target.value) })}
            onBlur={() => {
              if (!d.slug && suggestedSlug) setD({ ...d, slug: suggestedSlug });
            }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Açıklama (meta description)</label>
          <input
            className="input mt-1"
            placeholder="150–160 karakterlik özet."
            value={d.description}
            onChange={(e) => setD({ ...d, description: e.target.value })}
            maxLength={220}
          />
          <div className="mt-1 text-xs text-stone-500">{d.description.length} karakter</div>
        </div>

        <div>
          <label className="block text-sm font-medium">Öne çıkarılan görsel</label>
          <div className="mt-1">
            <BlogImageUpload onDone={(url) => setD({ ...d, image: url })} />
          </div>
          {d.image && (
            <div className="mt-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={d.image}
                alt="Önizleme"
                className="h-40 w-full rounded-lg object-cover ring-1 ring-stone-200"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">İçerik</label>
          <textarea
            className="input mt-1 h-64"
            placeholder="HTML veya düz yazı / markdown (temel etiketleri destekliyoruz)"
            value={d.content}
            onChange={(e) => setD({ ...d, content: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Durum</label>
          <select
            className="input mt-1"
            value={d.status}
            onChange={(e) => setD({ ...d, status: e.target.value as "draft" | "pub" })}
          >
            <option value="pub">Yayınla</option>
            <option value="draft">Taslak</option>
          </select>
          <p className="mt-1 text-xs text-stone-500">
            “Yayınla” seçilirse /blog listesine düşer, taslaklar sadece panelde görünür.
          </p>
        </div>

        {err && <p className="text-sm text-red-600">{err}</p>}
        {msg && <p className="text-sm text-emerald-600">{msg}</p>}

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary disabled:opacity-60"
          >
            {saving ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>
      </form>
    </div>
  );
}
