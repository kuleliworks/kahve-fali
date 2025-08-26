"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BlogImageUpload from "@/components/BlogImageUpload";

type D = {
  title: string;
  slug: string;
  description: string;
  image: string;
  content: string;
  status: "draft" | "pub";

  // SEO
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
};

function normalizeSlug(s: string) {
  const map: Record<string,string> = {
    ç:"c", ğ:"g", ı:"i", i:"i", ö:"o", ş:"s", ü:"u",
    Ç:"c", Ğ:"g", İ:"i", I:"i", Ö:"o", Ş:"s", Ü:"u",
  };
  return s
    .trim()
    .replace(/[^\w\s-]/g, "")
    .split("")
    .map(ch => map[ch] ?? ch)
    .join("")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

export default function NewPostClient() {
  const router = useRouter();
  const qs = useSearchParams();

  const [tab, setTab] = useState<"icerik" | "seo">("icerik");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [d, setD] = useState<D>({
    title: "",
    slug: "",
    description: "",
    image: "",
    content: "",
    status: "draft",
    seoTitle: "",
    seoDescription: "",
    ogImage: "",
  });

  // otomatik slug öner
  const autoSlug = useMemo(() => normalizeSlug(d.title || ""), [d.title]);

  async function onSave() {
    try {
      setSaving(true);
      setMsg(null);

      const finalSlug = normalizeSlug(d.slug || d.title || "yazi");

      const res = await fetch("/api/blog/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          title: d.title,
          slug: finalSlug,
          description: d.description,
          image: d.image,
          content: d.content,
          status: d.status,
          // SEO
          seoTitle: d.seoTitle,
          seoDescription: d.seoDescription,
          ogImage: d.ogImage,
        }),
      });

      const json = await res.json().catch(() => ({} as any));
      if (!res.ok || !json?.ok) throw new Error(json?.error || "Kayıt başarısız.");

      // Başarılı alert + 2 seçenek
      setMsg("✅ İçerik kaydedildi.");
      // 2 butonlu basit seçim:
      // – Yazıyı gör
      // – Yeni yazı ekle
      setTimeout(() => {
        if (confirm("İçerik kaydedildi. Yazıyı görüntülemek ister misin?")) {
          router.push(`/blog/${json.slug}`);
        } else {
          // formu sıfırla
          setD({
            title: "",
            slug: "",
            description: "",
            image: "",
            content: "",
            status: "draft",
            seoTitle: "",
            seoDescription: "",
            ogImage: "",
          });
          setTab("icerik");
        }
      }, 300);
    } catch (e: any) {
      setMsg(e?.message || "Kayıt hatası");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-4">
      <div className="mb-4 flex gap-2">
        <button
          className={`btn ${tab === "icerik" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setTab("icerik")}
          type="button"
        >
          İçerik
        </button>
        <button
          className={`btn ${tab === "seo" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setTab("seo")}
          type="button"
        >
          SEO
        </button>
      </div>

      {tab === "icerik" && (
        <div className="k-card p-4 space-y-4">
          <div>
            <label className="text-sm font-medium">Başlık</label>
            <input
              className="input mt-1"
              placeholder="Başlık"
              value={d.title}
              onChange={(e) => setD({ ...d, title: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Slug</label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <input
                className="input"
                placeholder={`Örn: ${autoSlug}`}
                value={d.slug}
                onChange={(e) => setD({ ...d, slug: e.target.value })}
              />
              <div className="text-xs text-stone-500 self-center">
                Boş bırakılırsa “{autoSlug}” kullanılır.
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Kısa açıklama</label>
            <textarea
              className="input h-28 mt-1"
              placeholder="Meta description ve liste kartları için 120–160 karakter ideal."
              value={d.description}
              onChange={(e) => setD({ ...d, description: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Öne çıkarılan görsel</label>
            <div className="mt-1">
              <BlogImageUpload onDone={(url) => setD({ ...d, image: url })} />
              {d.image && (
                <div className="mt-2 overflow-hidden rounded-xl ring-1 ring-stone-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={d.image} alt="Önizleme" className="h-40 w-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">İçerik (HTML/Markdown)</label>
            <textarea
              className="input h-64 mt-1"
              placeholder="İçerik"
              value={d.content}
              onChange={(e) => setD({ ...d, content: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Durum</label>
            <select
              className="input mt-1"
              value={d.status}
              onChange={(e) => setD({ ...d, status: e.target.value as D["status"] })}
            >
              <option value="draft">Taslak</option>
              <option value="pub">Yayınla</option>
            </select>
          </div>
        </div>
      )}

      {tab === "seo" && (
        <div className="k-card p-4 space-y-4">
          <div>
            <label className="text-sm font-medium">SEO Başlığı (opsiyonel)</label>
            <input
              className="input mt-1"
              placeholder="Varsa sayfa <title> için özel başlık"
              value={d.seoTitle || ""}
              onChange={(e) => setD({ ...d, seoTitle: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">SEO Açıklaması (opsiyonel)</label>
            <textarea
              className="input h-28 mt-1"
              placeholder="Meta description — boşsa kısa açıklama veya içerikten özet üretilecek"
              value={d.seoDescription || ""}
              onChange={(e) => setD({ ...d, seoDescription: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">OG/Twitter Görseli (opsiyonel)</label>
            <div className="mt-1">
              <BlogImageUpload onDone={(url) => setD({ ...d, ogImage: url })} />
              {d.ogImage && (
                <div className="mt-2 overflow-hidden rounded-xl ring-1 ring-stone-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={d.ogImage} alt="OG Önizleme" className="h-40 w-full object-cover" />
                </div>
              )}
              {!d.ogImage && d.image && (
                <div className="mt-2 text-xs text-stone-500">
                  OG görseli seçmezsen öne çıkarılan görsel kullanılacak.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-stone-600">{msg}</div>
        <button className="btn btn-primary" onClick={onSave} disabled={saving} type="button">
          {saving ? "Kaydediliyor…" : "Kaydet"}
        </button>
      </div>
    </div>
  );
}
