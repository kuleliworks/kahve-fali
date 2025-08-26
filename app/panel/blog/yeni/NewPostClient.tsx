// app/panel/blog/yeni/NewPostClient.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BlogImageUpload from "@/components/BlogImageUpload";

type Status = "pub" | "draft";

export default function NewPostClient() {
  const [d, setD] = useState({
    title: "",
    slug: "",
    description: "",
    image: "",
    content: "",
    status: "pub" as Status,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!d.title.trim()) {
      setErr("Başlık zorunludur.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/blog/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify(d),
      });

      const text = await res.text();
      let json: any = {};
      try {
        json = JSON.parse(text);
      } catch {
        json = { ok: false, error: text || `HTTP ${res.status}` };
      }

      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || `HTTP ${res.status}`);
      }

      // Başarılı — iki seçenekli basit confirm
      const go = confirm("Yazı kaydedildi. 'Tamam' ile yazıya git, 'İptal' ile yeni yazı ekle.");
      if (go) {
        router.push(`/blog/${encodeURIComponent(json.slug)}`);
      } else {
        setD({ title: "", slug: "", description: "", image: "", content: "", status: d.status });
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (e: any) {
      setErr(e?.message || "Kaydetme başarısız.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl p-4">
      <div className="k-card">
        <h1 className="text-xl font-semibold">Yeni Yazı</h1>

        <label className="mt-4 block text-sm font-medium">Başlık</label>
        <input
          className="input mt-1"
          value={d.title}
          onChange={(e) => setD({ ...d, title: e.target.value })}
          placeholder="Örn: Kahve Falı Nedir?"
        />

        <label className="mt-4 block text-sm font-medium">Slug (opsiyonel)</label>
        <input
          className="input mt-1"
          value={d.slug}
          onChange={(e) => setD({ ...d, slug: e.target.value })}
          placeholder="kahve-fali-nedir"
        />

        <label className="mt-4 block text-sm font-medium">Kısa açıklama (description)</label>
        <textarea
          className="input mt-1 h-24"
          value={d.description}
          onChange={(e) => setD({ ...d, description: e.target.value })}
          placeholder="Arama sonuçları için 150–160 karakter"
        />

        <label className="mt-4 block text-sm font-medium">Öne çıkarılan görsel</label>
        <div className="mt-1">
          <BlogImageUpload onDone={(url) => setD({ ...d, image: url })} />
          {d.image && (
            <div className="mt-2 overflow-hidden rounded-xl border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={d.image} alt="Önizleme" className="h-48 w-full object-cover" />
            </div>
          )}
        </div>

        <label className="mt-4 block text-sm font-medium">İçerik (HTML veya Markdown)</label>
        <textarea
          className="input mt-1 h-64"
          value={d.content}
          onChange={(e) => setD({ ...d, content: e.target.value })}
          placeholder="<p>...</p>"
        />

        <label className="mt-4 block text-sm font-medium">Durum</label>
        <select
          className="input mt-1"
          value={d.status}
          onChange={(e) => setD({ ...d, status: e.target.value as Status })}
        >
          <option value="pub">Yayınla</option>
          <option value="draft">Taslak</option>
        </select>

        {err && <p className="mt-3 text-sm text-red-600">{err}</p>}

        <div className="mt-6 flex gap-3">
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => router.push("/panel/blog")}>
            İptal
          </button>
        </div>
      </div>
    </form>
  );
}
