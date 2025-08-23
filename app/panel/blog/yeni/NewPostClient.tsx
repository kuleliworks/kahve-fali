"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BlogImageUpload from "@/components/BlogImageUpload";


type Draft = {
  title?: string;
  slug?: string;
  description?: string;
  image?: string;
  content?: string; // HTML/Markdown
  status?: "draft" | "pub" | "scheduled";
  publishAt?: string; // datetime-local
};

export default function NewPostClient() {
  const sp = useSearchParams();
  const editSlug = sp.get("edit") || null;
  const router = useRouter();

  const [d, setD] = useState<Draft>({ status: "draft" });
  const [slugTaken, setSlugTaken] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<{ slug: string } | null>(null);

  // (Opsiyonel) düzenleme modu — şimdilik slug’ı kilitleyip uyarı gösteriyoruz
  useEffect(() => {
    async function loadEdit() {
      if (!editSlug) return;
      const res = await fetch(`/api/panel/blog/check-slug?slug=${encodeURIComponent(editSlug)}`, { cache: "no-store" });
      const j = await res.json();
      if (j.exists) {
        setD((p) => ({ ...p, slug: editSlug }));
        setSlugTaken(true);
      }
    }
    loadEdit();
  }, [editSlug]);

  const finalSlug = useMemo(() => (d.slug || d.title || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-ğüşöçı]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, ""), [d.slug, d.title]);

  async function checkSlug() {
    if (!finalSlug) { setSlugTaken(null); return; }
    const res = await fetch(`/api/panel/blog/check-slug?slug=${encodeURIComponent(finalSlug)}`, { cache: "no-store" });
    const json = await res.json();
    setSlugTaken(!!json.exists);
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const ts = d.publishAt ? Date.parse(d.publishAt) : null;
      const res = await fetch("/api/panel/blog/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: d.title,
          slug: finalSlug,
          description: d.description,
          image: d.image,
          content: d.content,
          status: d.status,
          publishAt: ts && Number.isFinite(ts) ? ts : null,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        alert(json.error || "Kaydedilemedi");
        return;
      }
      setSaved({ slug: json.slug });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold">{editSlug ? "Yazıyı Düzenle" : "Yeni Yazı"}</h1>

      <form className="mt-6 space-y-4" onSubmit={onSave}>
        <div>
          <label className="text-sm font-medium">Başlık</label>
          <input className="input mt-1" placeholder="Başlık"
            value={d.title || ""} onChange={(e) => setD({ ...d, title: e.target.value })} />
        </div>

        <div>
          <label className="text-sm font-medium">Slug</label>
          <div className="flex gap-2">
            <input
              className="input mt-1 flex-1"
              placeholder="slug"
              value={editSlug ? editSlug : (d.slug || "")}
              onChange={(e) => { if (!editSlug) setD({ ...d, slug: e.target.value }); }}
              onBlur={checkSlug}
              disabled={!!editSlug}
            />
            <button type="button" className="btn btn-ghost mt-1" onClick={checkSlug}>Kontrol</button>
          </div>
          {slugTaken === true && !editSlug && (
            <p className="mt-1 text-sm text-red-600">Bu slug zaten kullanılıyor.</p>
          )}
          {slugTaken === false && (
            <p className="mt-1 text-sm text-green-700">Slug uygun.</p>
          )}
          <p className="mt-1 text-xs text-stone-500">Otomatik: <code>{finalSlug || "-"}</code></p>
        </div>

        <div>
          <label className="text-sm font-medium">Açıklama (SEO)</label>
          <textarea className="input mt-1 h-20" placeholder="Kısa açıklama"
            value={d.description || ""} onChange={(e) => setD({ ...d, description: e.target.value })} />
        </div>

<div>
  <label className="text-sm font-medium">Öne çıkan görsel</label>
  <div className="mt-1">
    <BlogImageUpload
      value={d.image}
      onDone={(url) => setD({ ...d, image: url })}
    />
  </div>
  {d.image && (
    <div className="mt-2 flex items-center gap-2">
      <input className="input flex-1" value={d.image} readOnly />
      <button
        type="button"
        className="btn btn-ghost"
        onClick={() => setD({ ...d, image: undefined })}
      >
        Kaldır
      </button>
    </div>
  )}
  <p className="mt-1 text-xs text-stone-500">
    Desteklenen: JPG/PNG/WebP, ~12MB&apos;a kadar. Yükledikten sonra URL otomatik eklenir.
  </p>
</div>


        <div>
          <label className="text-sm font-medium">İçerik (HTML/Markdown)</label>
          <textarea className="input mt-1 h-64" placeholder="<p>…</p>"
            value={d.content || ""} onChange={(e) => setD({ ...d, content: e.target.value })} />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-sm font-medium">Durum</label>
            <select className="input mt-1" value={d.status || "draft"}
              onChange={(e) => setD({ ...d, status: e.target.value as any })}>
              <option value="draft">Taslak</option>
              <option value="pub">Yayımla</option>
              <option value="scheduled">Zamanla</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="text-sm font-medium">Yayın zamanı (isteğe bağlı)</label>
            <input
              className="input mt-1"
              type="datetime-local"
              value={d.publishAt || ""}
              onChange={(e) => setD({ ...d, publishAt: e.target.value })}
            />
            <p className="mt-1 text-xs text-stone-500">
              Geleceğe tarih verirsen durum “Yayımla” olsa da otomatik “Zamanla” kaydedilir.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button className="btn btn-primary" type="submit"
            disabled={saving || slugTaken === true}>
            {saving ? "Kaydediliyor…" : "Kaydet"}
          </button>
          <a href="/panel/blog" className="btn btn-ghost">Panele dön</a>
        </div>
      </form>

      {saved && (
        <div className="k-card mt-6 border-green-200 bg-green-50">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-medium">İçerik eklendi</div>
              <div className="text-sm text-stone-700">/{saved.slug} yayın kuyruğuna alındı.</div>
            </div>
            <div className="flex items-center gap-2">
              <a className="btn btn-ghost" href={`/blog/${saved.slug}`} target="_blank" rel="noopener">Yazıyı gör</a>
              <button className="btn btn-primary" onClick={() => {
                setD({ status: "draft" });
                setSaved(null);
                setSlugTaken(null);
              }}>
                Yeni yazı ekle
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
