"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BlogImageUpload from "@/components/BlogImageUpload";

/** Basit TR slugify */
function slugify(input: string) {
  return input
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
}

type Status = "draft" | "pub";

type Draft = {
  title: string;
  slug?: string;
  description?: string;
  image?: string; // BlogImageUpload döndürdüğü URL
  content: string;
  status: Status;
};

export default function NewPostClient() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [d, setD] = useState<Draft>({
    title: "",
    slug: "",
    description: "",
    image: "",
    content: "",
    status: "draft",
  });

  async function onSave() {
    if (!d.title?.trim() || !d.content?.trim()) {
      alert("Başlık ve içerik zorunludur.");
      return;
    }

    setSaving(true);
    try {
      // slug tercih sırası: kullanıcı girdiyse onu, yoksa başlıktan üret
      const base = (d.slug && d.slug.trim()) || slugify(d.title || "");
      const finalSlug = base || `yazi-${Date.now()}`;

      // 12 sn client-timeout
      const ac = new AbortController();
      const t = setTimeout(() => ac.abort(), 12000);

      const res = await fetch("/api/blog/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: ac.signal,
        body: JSON.stringify({
          title: d.title.trim(),
          slug: finalSlug,
          description: d.description?.trim() || "",
          image: d.image || "",
          content: d.content.trim(),
          status: d.status,
        }),
      }).finally(() => clearTimeout(t));

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) {
        // Sunucu duplicate slug için 409 + {error:"Bu slug zaten mevcut."} döndürüyor
        throw new Error(json?.error || "Kayıt başarısız.");
      }

      // Başarılı ise kullanıcıya seçenek sun
      const goView = confirm("Yazı eklendi. Görüntülemek ister misin?");
      if (goView) {
        router.push(`/blog/${json.slug || finalSlug}`);
      } else {
        router.push("/panel/blog");
      }
    } catch (e: any) {
      alert(e?.name === "AbortError" ? "İstek zaman aşımına uğradı." : (e?.message || "Hata"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {/* KART */}
      <div className="k-card">
        <h1 className="text-2xl font-semibold">Yeni Blog Yazısı</h1>
        <p className="mt-1 text-sm text-stone-600">
          Başlık, içerik ve öne çıkarılan görsel ekleyerek yeni bir yazı oluştur.
        </p>

        <div className="mt-6 grid gap-5">
          {/* Başlık */}
          <div>
            <label className="block text-sm font-medium text-stone-800">
              Başlık <span className="text-red-600">*</span>
            </label>
            <input
              className="input mt-1"
              placeholder="Örn: Kahve Falında Yılan Görmek"
              value={d.title}
              onChange={(e) => setD({ ...d, title: e.target.value })}
            />
          </div>

          {/* Slug (opsiyonel) */}
          <div>
            <label className="block text-sm font-medium text-stone-800">
              Slug (isteğe bağlı)
            </label>
            <input
              className="input mt-1"
              placeholder="ornegin: kahve-falinda-yilan-gormek"
              value={d.slug || ""}
              onChange={(e) => setD({ ...d, slug: e.target.value })}
            />
            <p className="mt-1 text-xs text-stone-500">
              Boş bırakırsan başlıktan otomatik üretilecektir.
            </p>
          </div>

          {/* Kısa açıklama */}
          <div>
            <label className="block text-sm font-medium text-stone-800">
              Kısa açıklama (description)
            </label>
            <textarea
              className="input mt-1 h-24"
              placeholder="Yazının arama sonuçlarında görünecek kısa özeti."
              value={d.description || ""}
              onChange={(e) => setD({ ...d, description: e.target.value })}
            />
          </div>

          {/* Öne çıkarılan görsel (upload) */}
          <div>
            <label className="block text-sm font-medium text-stone-800">
              Öne çıkarılan görsel
            </label>
            <div className="mt-1">
              {/* BlogImageUpload yalnızca onDone alır; value prop'u yok */}
              <BlogImageUpload
                onDone={(url) => setD({ ...d, image: url })}
              />
            </div>

            {/* Küçük önizleme */}
            {d.image ? (
              <div className="mt-3 overflow-hidden rounded-xl ring-1 ring-stone-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={d.image}
                  alt="Öne çıkarılan görsel"
                  className="h-40 w-full object-cover"
                />
              </div>
            ) : (
              <p className="mt-2 text-xs text-stone-500">
                Yükledikten sonra burada küçük bir önizleme göreceksin.
              </p>
            )}
          </div>

          {/* İçerik */}
          <div>
            <label className="block text-sm font-medium text-stone-800">
              İçerik <span className="text-red-600">*</span>
            </label>
            <textarea
              className="input mt-1 h-72"
              placeholder="İçeriği buraya yaz (HTML/Markdown da girebilirsin)."
              value={d.content}
              onChange={(e) => setD({ ...d, content: e.target.value })}
            />
            <p className="mt-1 text-xs text-stone-500">
              Basit HTML etiketleri desteklenir; güvenlik için sunucuda filtrelenir.
            </p>
          </div>

          {/* Durum */}
          <div>
            <label className="block text-sm font-medium text-stone-800">Durum</label>
            <select
              className="input mt-1"
              value={d.status}
              onChange={(e) => setD({ ...d, status: (e.target.value as Status) || "draft" })}
            >
              <option value="draft">Taslak</option>
              <option value="pub">Yayınla</option>
            </select>
          </div>

          {/* Aksiyonlar */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => router.push("/panel/blog")}
              disabled={saving}
            >
              İptal
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onSave}
              disabled={saving}
            >
              {saving ? "Kaydediliyor…" : "Kaydet / Yayınla"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
