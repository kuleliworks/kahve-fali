"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BlogImageUpload from "@/components/BlogImageUpload";

type Draft = {
  title: string;
  slug: string;
  description: string;
  image: string;    // <- ÖNEMLİ
  content: string;
  status: "draft" | "pub";
};

export default function NewPostClient() {
  const router = useRouter();
  const [d, setD] = useState<Draft>({
    title: "",
    slug: "",
    description: "",
    image: "",          // <- ÖNEMLİ
    content: "",
    status: "draft",
  });
  const [saving, setSaving] = useState(false);

  async function onSave() {
    setSaving(true);
    try {
      // slug boşsa otomatik üret
      const base =
        d.slug ||
        d.title
          .toLowerCase()
          .normalize("NFKD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/ı/g, "i")
          .replace(/ğ/g, "g")
          .replace(/ü/g, "u")
          .replace(/ş/g, "s")
          .replace(/ö/g, "o")
          .replace(/ç/g, "c")
          .replace(/[^a-z0-9\- ]/g, "")
          .trim()
          .replace(/\s+/g, "-");
      const slug = base || `yazi-${Date.now()}`;

      const res = await fetch("/api/blog/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: d.title,
          slug,
          description: d.description,
          image: d.image,      // <- ÖNEMLİ: image alanı JSON’a giriyor
          content: d.content,
          status: d.status,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Kayıt başarısız");

      // İsteğe bağlı: alert + nereye gitsin?
      if (confirm("Yazı eklendi. Görüntülemek ister misin?")) {
        router.push(`/blog/${slug}`);
      } else {
        router.push(`/panel/blog`);
      }
    } catch (e: any) {
      alert(e?.message || "Hata");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Yeni Yazı</h1>

      <div className="mt-6 space-y-4">
        <input
          className="input w-full"
          placeholder="Başlık"
          value={d.title}
          onChange={(e) => setD({ ...d, title: e.target.value })}
        />

        <input
          className="input w-full"
          placeholder="Slug (opsiyonel)"
          value={d.slug}
          onChange={(e) => setD({ ...d, slug: e.target.value })}
        />

        <textarea
          className="input w-full h-24"
          placeholder="Kısa açıklama (description)"
          value={d.description}
          onChange={(e) => setD({ ...d, description: e.target.value })}
        />

        {/* Görsel yükleme (URL state’e otomatik yazılır) */}
        <BlogImageUpload
          value={d.image}
          onDone={(url) => setD({ ...d, image: url })}
        />

        <textarea
          className="input w-full h-64"
          placeholder="İçerik (HTML veya markdown — siz nasıl okuyorsanız)"
          value={d.content}
          onChange={(e) => setD({ ...d, content: e.target.value })}
        />

        <select
          className="input"
          value={d.status}
          onChange={(e) => setD({ ...d, status: e.target.value as Draft["status"] })}
        >
          <option value="draft">Taslak</option>
          <option value="pub">Yayınla</option>
        </select>

        <div className="pt-3">
          <button className="btn btn-primary" disabled={saving} onClick={onSave}>
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}
