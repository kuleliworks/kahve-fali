"use client";

import { useState, useRef } from "react";
import BlogImageUpload from "@/components/BlogImageUpload";

type Draft = {
  title?: string;
  slug?: string;
  description?: string;
  image?: string;
  content?: string;
  status?: "draft" | "pub";
};

export default function NewPostClient() {
  const [d, setD] = useState<Draft>({ status: "draft" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Kayıt sonrası üstte göstereceğimiz bildirim
  const [notice, setNotice] = useState<{ slug: string } | null>(null);

  const controllerRef = useRef<AbortController | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const title = (d.title || "").trim();
    const content = (d.content || "").trim();
    if (!title || !content) {
      setError("Başlık ve içerik zorunludur.");
      return;
    }

    try {
      setLoading(true);
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      // slug’ı olduğu gibi gönderiyoruz (backend uniq kontrolü var)
      const payload = {
        title,
        slug: (d.slug || "").trim(),
        description: (d.description || "").trim(),
        image: (d.image || "").trim(),
        content,
        status: d.status || "draft",
      };

      const res = await fetch("/api/blog/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
        cache: "no-store",
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "Kayıt başarısız.");
      }

      // YÖNLENDİRME YOK — Sayfa içinde “başarılı” bar’ı göster
      const finalSlug: string = json.slug;
      setNotice({ slug: finalSlug });
      // Formu sıfırla
      setD({ status: "draft" });
      (document.getElementById("title") as HTMLInputElement | null)?.focus();
    } catch (err: any) {
      if (err?.name === "AbortError") {
        setError("İstek iptal edildi, tekrar deneyin.");
      } else {
        setError(err?.message || "Beklenmedik hata.");
      }
    } finally {
      setLoading(false);
    }
  };

  const onNewAgain = () => {
    setNotice(null);
    setD({ status: "draft" });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* ÜST BİLDİRİM BAR */}
      {notice && (
        <div className="fixed inset-x-0 top-0 z-50">
          <div className="mx-auto max-w-3xl px-4">
            <div className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-emerald-800">
                  <strong>Yazı oluşturuldu.</strong> İşlemin tamamlandı.
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() =>
                      window.open(`/blog/${encodeURIComponent(notice.slug)}`, "_blank", "noopener")
                    }
                  >
                    Yazıyı gör
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={onNewAgain}>
                    Yeni yazı
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <h1 className="mb-6 text-2xl font-semibold">Yeni Blog Yazısı</h1>

      <form onSubmit={handleSubmit} className="k-card space-y-4">
        {/* Başlık */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-stone-700">
            Başlık *
          </label>
          <input
            id="title"
            className="input mt-1"
            placeholder="Örn: Kahve Falında Yılan Görmek"
            value={d.title || ""}
            onChange={(e) => setD({ ...d, title: e.target.value })}
            required
          />
        </div>

        {/* Slug */}
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-stone-700">
            URL Slug (isteğe bağlı)
          </label>
          <input
            id="slug"
            className="input mt-1"
            placeholder="ornegin-kahve-falinda-yilan-gormek"
            value={d.slug || ""}
            onChange={(e) => setD({ ...d, slug: e.target.value })}
          />
          <p className="mt-1 text-xs text-stone-500">
            Boş bırakırsan otomatik üretilecek. Türkçe karakterleri ve boşlukları kendiliğinden
            dönüştürüyoruz.
          </p>
        </div>

        {/* Açıklama */}
        <div>
          <label htmlFor="desc" className="block text-sm font-medium text-stone-700">
            Kısa açıklama (description)
          </label>
          <textarea
            id="desc"
            className="input mt-1 h-24"
            placeholder="Meta açıklama — aramalarda özet olarak görünebilir."
            value={d.description || ""}
            onChange={(e) => setD({ ...d, description: e.target.value })}
          />
        </div>

        {/* Öne çıkarılan görsel */}
        <div>
          <label className="block text-sm font-medium text-stone-700">
            Öne çıkarılan görsel
          </label>
          <div className="mt-1">
            <BlogImageUpload onDone={(url) => setD({ ...d, image: url })} />
          </div>
          {d.image && (
            <div className="mt-2 overflow-hidden rounded-lg border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={d.image} alt="Önizleme" className="h-40 w-full object-cover" />
            </div>
          )}
        </div>

        {/* İçerik */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-stone-700">
            İçerik *
          </label>
          <textarea
            id="content"
            className="input mt-1 h-64"
            placeholder="İçerik (HTML veya Markdown; HTML daha güçlü)."
            value={d.content || ""}
            onChange={(e) => setD({ ...d, content: e.target.value })}
            required
          />
        </div>

        {/* Durum */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-stone-700">
            Durum
          </label>
          <select
            id="status"
            className="input mt-1"
            value={d.status || "draft"}
            onChange={(e) =>
              setD({ ...d, status: (e.target.value as "draft" | "pub") || "draft" })
            }
          >
            <option value="draft">Taslak</option>
            <option value="pub">Yayınla</option>
          </select>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="pt-2">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </form>
    </div>
  );
}
