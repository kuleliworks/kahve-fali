"use client";

import { useState } from "react";
import BlogImageUpload from "@/components/BlogImageUpload";
import { useRouter } from "next/navigation";

type Status = "draft" | "pub";

function toSlug(s: string) {
  // Türkçe karakterleri ascii'ye çevir + normalize
  const map: Record<string, string> = {
    ç: "c",
    Ç: "c",
    ğ: "g",
    Ğ: "g",
    ı: "i",
    İ: "i",
    ö: "o",
    Ö: "o",
    ş: "s",
    Ş: "s",
    ü: "u",
    Ü: "u",
  };
  const replaced = s
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("");
  return replaced
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function NewPostClient() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | undefined>(undefined);
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<Status>("draft");

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const finalSlug = slug ? toSlug(slug) : toSlug(title);

  async function onSave() {
    setErr(null);
    setSaving(true);
    try {
      if (!title.trim()) throw new Error("Başlık gerekli");
      if (!finalSlug) throw new Error("Slug üretilemedi (başlık/slug gerekli)");

      const res = await fetch("/api/blog/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // önemli: image alanı burada string URL
        body: JSON.stringify({
          title,
          slug: finalSlug,
          description,
          image,
          content,
          status,
        }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `HTTP ${res.status}`);
      }
      const json = await res.json().catch(() => ({} as any));
      // Eklendikten sonra yönlendirme yerine bildirim göster + seçenek sun
      if (json?.ok) {
        if (confirm("Yazı kaydedildi. Görüntülemek ister misiniz?")) {
          router.push(`/blog/${finalSlug}`);
        } else {
          // formu sıfırla, yeni ekleme yap
          setTitle("");
          setSlug("");
          setDescription("");
          setImage(undefined);
          setContent("");
          setStatus("draft");
        }
        return;
      }
      throw new Error(json?.error || "Kayıt başarısız");
    } catch (e: any) {
      setErr(e?.message || "Kayıt sırasında hata oluştu.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!saving) onSave();
      }}
      className="space-y-4"
    >
      {/* Başlık */}
      <div>
        <label className="block text-sm font-medium">Başlık</label>
        <input
          className="input mt-1"
          placeholder="Örn: Kahve Falında Yılan Görmek"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-medium">Slug</label>
        <input
          className="input mt-1"
          placeholder="ornegin: kahve-falinda-yilan-gormek"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
        <div className="mt-1 text-xs text-stone-500">/blog/{finalSlug || "-"}</div>
      </div>

      {/* Kısa açıklama */}
      <div>
        <label className="block text-sm font-medium">Kısa açıklama</label>
        <textarea
          className="input mt-1 h-24"
          placeholder="Arama sonuçlarında görünecek özet"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Görsel yükleme */}
      <div>
        <label className="block text-sm font-medium">Öne çıkarılan görsel</label>
        <div className="mt-1">
          <BlogImageUpload onDone={(url) => setImage(url)} />
        </div>
        {image && (
          <div className="mt-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt="Seçilen görsel"
              className="h-28 w-40 rounded-xl object-cover ring-1 ring-stone-200"
            />
          </div>
        )}
      </div>

      {/* İçerik */}
      <div>
        <label className="block text-sm font-medium">İçerik (HTML/Markdown düz yazı)</label>
        <textarea
          className="input mt-1 h-64"
          placeholder="İçeriği yazın…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      {/* Durum */}
      <div>
        <label className="block text-sm font-medium">Durum</label>
        <select
          className="input mt-1"
          value={status}
          onChange={(e) => setStatus(e.target.value as Status)}
        >
          <option value="draft">Taslak</option>
          <option value="pub">Yayınla</option>
        </select>
      </div>

      {err && <div className="text-sm text-red-600">{err}</div>}

      <div className="pt-2">
        <button type="submit" disabled={saving} className="btn btn-primary">
          {saving ? "Kaydediliyor…" : "Kaydet"}
        </button>
      </div>
    </form>
  );
}
