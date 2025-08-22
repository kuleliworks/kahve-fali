"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import BlogImageUpload from "@/components/BlogImageUpload";

type Status = "pub" | "draft";

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/[^a-z0-9\-_\s]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

export default function Page() {
  const r = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string>("");
  const [content, setContent] = useState<string>(""); // HTML içerik
  const [status, setStatus] = useState<Status>("pub");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const finalSlug = slug || slugify(title);
    if (!title || !finalSlug) {
      setErr("Başlık gerekli.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/blog/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug: finalSlug, description, image, content, status }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Kaydetme hatası");
      r.push(`/blog/${json.slug || finalSlug}`);
    } catch (e: any) {
      setErr(e?.message || "Bilinmeyen hata");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Yeni Blog Yazısı</h1>

      <form onSubmit={onSubmit} className="mt-6 space-y-6">
        <div className="k-card space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium">Başlık</label>
              <input
                className="input mt-1"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: Kahve Falında Yılan Görmek"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Slug (opsiyonel)</label>
              <input
                className="input mt-1"
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                placeholder="kahve-falinda-yilan-gormek"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Kısa açıklama (description)</label>
            <input
              className="input mt-1"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Yazının kısa özeti (SEO)."
            />
          </div>

          {/* Görsel dosya yükleme (Vercel Blob) */}
          <BlogImageUpload value={image} onChange={setImage} />

          <div>
            <label className="block text-sm font-medium">İçerik (HTML)</label>
            <textarea
              className="mt-1 w-full rounded-xl border p-3"
              rows={14}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="<h2>Başlık</h2><p>HTML içerik...</p>"
            />
            <p className="mt-1 text-xs text-stone-500">
              İçerik HTML olarak kaydedilir; sitede güvenlik için sanitize edilerek gösterilir.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Durum:</label>
            <button
              type="button"
              className={`btn ${status === "pub" ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setStatus("pub")}
            >
              Yayınla
            </button>
            <button
              type="button"
              className={`btn ${status === "draft" ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setStatus("draft")}
            >
              Taslak
            </button>
          </div>

          {err && <div className="text-sm text-red-600">{err}</div>}

          <div className="flex items-center justify-end gap-3">
            <a href="/panel" className="btn btn-ghost">Vazgeç</a>
            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? "Kaydediliyor…" : "Kaydet"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
