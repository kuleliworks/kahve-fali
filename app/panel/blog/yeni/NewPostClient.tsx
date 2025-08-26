"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BlogImageUpload from "@/components/BlogImageUpload";

type Draft = {
  title?: string;
  slug?: string;
  description?: string;
  image?: string;
  content?: string;
  status?: "pub" | "draft";
};

function slugifyTR(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/--+/g, "-");
}

export default function NewPostClient() {
  const router = useRouter();
  const sp = useSearchParams();

  // Form state
  const [d, setD] = useState<Draft>({
    title: "",
    slug: "",
    description: "",
    image: "",
    content: "",
    status: "pub",
  });

  // UI state
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [doneSlug, setDoneSlug] = useState<string | null>(null);

  // URL’den title/slug seed (opsiyonel)
  useEffect(() => {
    const t = sp.get("title");
    const s = sp.get("slug");
    if (t || s) {
      setD((prev) => ({
        ...prev,
        title: t ?? prev.title,
        slug: s ?? prev.slug,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finalSlug = useMemo(() => {
    const raw = (d.slug || d.title || "").trim();
    return slugifyTR(raw);
  }, [d.slug, d.title]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const title = (d.title || "").trim();
    const content = (d.content || "").trim();
    if (!title || !content) {
      setErr("Başlık ve içerik zorunludur.");
      return;
    }

    setSaving(true);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 20000); // 20 sn timeout

    try {
      const res = await fetch("/api/blog/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        signal: ctrl.signal,
        body: JSON.stringify({
          title,
          slug: finalSlug,
          description: d.description || "",
          image: d.image || "",
          content,
          status: d.status || "pub",
        }),
      });

      const text = await res.text();
      let json: any = {};
      try {
        json = text ? JSON.parse(text) : {};
      } catch {
        /* noop */
      }

      if (!res.ok || !json?.ok) {
        setErr(json?.error || `Kayıt başarısız (HTTP ${res.status})`);
        return;
      }

      setDoneSlug(json.slug);
      // formu sıfırla
      setD({
        title: "",
        slug: "",
        description: "",
        image: "",
        content: "",
        status: "pub",
      });
      // sitemap/önbellek beklemeyelim, sadece UI’de duyuralım
    } catch (e: any) {
      if (e?.name === "AbortError") {
        setErr("İstek zaman aşımına uğradı. Lütfen tekrar deneyin.");
      } else {
        setErr(e?.message || "Beklenmeyen bir hata oluştu.");
      }
    } finally {
      clearTimeout(timer);
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Başarılı oluşturma bildirimi */}
      {doneSlug && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-green-800">
              Yazı oluşturuldu: <strong>/blog/{doneSlug}</strong>
            </div>
            <div className="flex gap-2">
              <a
                className="btn btn-ghost"
                href={`/blog/${doneSlug}`}
                target="_blank"
                rel="noopener"
              >
                Yazıyı gör
              </a>
              <button
                className="btn btn-primary"
                onClick={() => setDoneSlug(null)}
                type="button"
              >
                Yeni yazı ekle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hata bildirimi */}
      {err && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {err}
        </div>
      )}

      <form onSubmit={handleSubmit} className="k-card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Başlık</label>
            <input
              className="input mt-1"
              placeholder="Örn: Kahve Falında Yılan Görmek"
              value={d.title || ""}
              onChange={(e) => setD({ ...d, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Slug</label>
            <input
              className="input mt-1"
              placeholder="otomatik: basliktan-uretilir"
              value={d.slug || ""}
              onChange={(e) => setD({ ...d, slug: e.target.value })}
            />
            <div className="mt-1 text-xs text-stone-500">
              Nihai: <code>/blog/{finalSlug || "slug"}</code>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Durum</label>
            <select
              className="input mt-1"
              value={d.status || "pub"}
              onChange={(e) => setD({ ...d, status: e.target.value as "pub" | "draft" })}
            >
              <option value="pub">Yayınla</option>
              <option value="draft">Taslak</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Kısa açıklama</label>
            <input
              className="input mt-1"
              placeholder="Açıklama (SEO description)"
              value={d.description || ""}
              onChange={(e) => setD({ ...d, description: e.target.value })}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Öne çıkarılan görsel</label>
            <div className="mt-1">
              <BlogImageUpload onDone={(url) => setD({ ...d, image: url })} />
            </div>
            {d.image && (
              <div className="mt-2 overflow-hidden rounded-lg border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={d.image}
                  alt="Önizleme"
                  className="aspect-[16/9] w-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">İçerik (HTML/Markdown)</label>
            <textarea
              className="input mt-1 h-64"
              placeholder="İçerik"
              value={d.content || ""}
              onChange={(e) => setD({ ...d, content: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </form>
    </div>
  );
}
