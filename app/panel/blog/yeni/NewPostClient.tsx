"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BlogImageUpload from "@/components/BlogImageUpload";

type FormState = {
  title: string;
  slug: string;
  description?: string;
  image?: string;   // Upload sonrası public URL burada tutulur
  content?: string;
  status: "draft" | "pub";
};

export default function NewPostClient() {
  const [d, setD] = useState<FormState>({
    title: "",
    slug: "",
    description: "",
    image: "",
    content: "",
    status: "draft",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function save() {
    setErr(null);
    setSaving(true);
    try {
      const body = {
        title: d.title,
        slug: d.slug,
        description: d.description,
        image: d.image,     // ← yüklenen görselin URL’i
        content: d.content,
        status: d.status,
      };

      const res = await fetch("/api/blog/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Kayıt başarısız.");

      alert("Yazı eklendi.");
      router.push(`/blog/${d.slug}`);
    } catch (e: any) {
      setErr(e?.message || "Hata");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">Yeni Yazı</h1>

      <div className="mt-6 grid gap-4">
        {/* Başlık */}
        <div>
          <label className="block text-sm font-medium">Başlık</label>
          <input
            className="input mt-1"
            value={d.title}
            onChange={(e) => setD({ ...d, title: e.target.value })}
            placeholder="Başlık"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium">Slug</label>
          <input
            className="input mt-1"
            value={d.slug}
            onChange={(e) => setD({ ...d, slug: e.target.value })}
            placeholder="ornek-yazi"
          />
          <p className="mt-1 text-xs text-stone-500">Küçük harf ve tire kullan.</p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium">Açıklama</label>
          <input
            className="input mt-1"
            value={d.description || ""}
            onChange={(e) => setD({ ...d, description: e.target.value })}
            placeholder="Kısa açıklama (SEO description)"
          />
        </div>

        {/* Görsel yükleme */}
        <div>
          <label className="block text-sm font-medium">Öne çıkan görsel</label>
          <div className="mt-1">
            <BlogImageUpload onDone={(url) => setD({ ...d, image: url })} />
            {d.image && (
              <>
                <div className="mt-3 overflow-hidden rounded-xl ring-1 ring-stone-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={d.image} alt="Önizleme" className="h-40 w-full object-cover" />
                </div>
                <p className="mt-2 break-all text-xs text-stone-600">URL: {d.image}</p>
              </>
            )}
          </div>
        </div>

        {/* İçerik */}
        <div>
          <label className="block text-sm font-medium">İçerik</label>
          <textarea
            className="input mt-1 h-64"
            value={d.content || ""}
            onChange={(e) => setD({ ...d, content: e.target.value })}
            placeholder="İçerik (HTML/Markdown/düz yazı)"
          />
        </div>

        {/* Durum */}
        <div>
          <label className="block text-sm font-medium">Durum</label>
          <select
            className="input mt-1"
            value={d.status}
            onChange={(e) => setD({ ...d, status: e.target.value as "draft" | "pub" })}
          >
            <option value="draft">Taslak</option>
            <option value="pub">Yayınla</option>
          </select>
        </div>

        {err && <p className="text-sm text-red-600">{err}</p>}

        <div className="pt-2">
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}
