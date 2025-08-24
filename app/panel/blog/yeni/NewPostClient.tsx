"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BlogImageUpload from "@/components/BlogImageUpload";

type Status = "draft" | "pub";

type Draft = {
  title?: string;
  slug?: string;
  description?: string;
  image?: string;      // Öne çıkan görsel URL ( /media/... )
  content?: string;    // HTML veya markdown (sen HTML kullanıyorsun)
  status?: Status;
  publishAt?: string;  // ISO (datetime-local’dan gelecek)
};

function slugify(input: string): string {
  const trMap: Record<string, string> = {
    ı: "i", İ: "i",
    ğ: "g", Ğ: "g",
    ü: "u", Ü: "u",
    ş: "s", Ş: "s",
    ö: "o", Ö: "o",
    ç: "c", Ç: "c",
  };
  const replaced = (input || "")
    .split("")
    .map((ch) => trMap[ch] ?? ch)
    .join("");

  return replaced
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function NewPostClient() {
  const router = useRouter();
  const [d, setD] = useState<Draft>({ status: "draft" });
  const [checking, setChecking] = useState(false);
  const [exists, setExists] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okModal, setOkModal] = useState<null | { slug: string }>(null);

  const finalSlug = useMemo(() => {
    const base = d.slug && d.slug.trim().length > 0 ? d.slug! : (d.title || "");
    return slugify(base);
  }, [d.slug, d.title]);

  // Slug mükerrer kontrol (debounce ~500ms)
  useEffect(() => {
    let timer: any;
    async function check() {
      if (!finalSlug) {
        setExists(false);
        return;
      }
      setChecking(true);
      try {
        const res = await fetch(`/api/blog/check-slug?slug=${encodeURIComponent(finalSlug)}`, {
          cache: "no-store",
        });
        const json = await res.json().catch(() => null);
        setExists(Boolean(json?.exists));
      } catch {
        // sessiz bırak
      } finally {
        setChecking(false);
      }
    }
    timer = setTimeout(check, 500);
    return () => clearTimeout(timer);
  }, [finalSlug]);

  async function onSave() {
    setError(null);

    if (!d.title || d.title.trim().length < 3) {
      setError("Başlık en az 3 karakter olmalı.");
      return;
    }
    if (!d.content || d.content.trim().length < 20) {
      setError("İçerik çok kısa görünüyor (en az 20 karakter).");
      return;
    }
    if (!finalSlug) {
      setError("Slug üretilemedi. Başlığı kontrol edin.");
      return;
    }
    if (exists) {
      setError("Bu slug zaten mevcut. Slug veya başlığı değiştirin.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: d.title?.trim(),
        slug: finalSlug,
        description: d.description?.trim() || "",
        image: d.image, // BlogImageUpload ile gelen URL (/media/...)
        content: d.content,
        status: d.status || "draft",
        publishAt: d.publishAt || "", // (opsiyonel) planlama
      };

      const res = await fetch("/api/blog/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok || !json?.slug) {
        throw new Error(json?.error || "Kaydetme başarısız");
      }

      // Başarılı → küçük modal (2 seçenek)
      setOkModal({ slug: json.slug });
    } catch (e: any) {
      setError(e?.message || "Beklenmedik bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setD({ status: "draft" });
    setError(null);
    setExists(false);
  }

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div>
        <label className="text-sm font-medium">Başlık</label>
        <input
          className="input mt-1"
          placeholder="Örn: Kahve Falında Yılan Görmek"
          value={d.title || ""}
          onChange={(e) => setD({ ...d, title: e.target.value })}
        />
      </div>

      {/* Slug (opsiyonel override) */}
      <div>
        <label className="text-sm font-medium">Slug (otomatik)</label>
        <div className="mt-1 flex items-center gap-2">
          <input
            className="input flex-1"
            placeholder="İstersen manuel gir"
            value={d.slug || ""}
            onChange={(e) => setD({ ...d, slug: e.target.value })}
          />
          <span className="text-xs text-stone-600">Önizleme: <code>/{finalSlug || "—"}</code></span>
        </div>
        <div className="mt-1 text-xs">
          {checking ? (
            <span className="text-stone-500">Kontrol ediliyor…</span>
          ) : exists ? (
            <span className="text-red-600">Bu slug zaten mevcut.</span>
          ) : finalSlug ? (
            <span className="text-green-600">Uygun görünüyor.</span>
          ) : (
            <span className="text-stone-500">Başlık yazınca otomatik oluşur.</span>
          )}
        </div>
      </div>

      {/* Açıklama */}
      <div>
        <label className="text-sm font-medium">Kısa açıklama (SEO description)</label>
        <textarea
          className="input mt-1 h-24"
          placeholder="Örn: Kahve falında yılan sembolünün olası anlamları ve ipuçları."
          value={d.description || ""}
          onChange={(e) => setD({ ...d, description: e.target.value })}
        />
        <div className="mt-1 text-xs text-stone-500">Öneri: 140–160 karakter.</div>
      </div>

      {/* Öne çıkan görsel (UPLOAD) */}
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
      </div>

      {/* Durum + Planlama */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Durum</label>
          <select
            className="input mt-1"
            value={d.status || "draft"}
            onChange={(e) => setD({ ...d, status: e.target.value as Status })}
          >
            <option value="draft">Taslak</option>
            <option value="pub">Yayınla</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Yayın zamanı (opsiyonel)</label>
          <input
            className="input mt-1"
            type="datetime-local"
            value={d.publishAt || ""}
            onChange={(e) => setD({ ...d, publishAt: e.target.value })}
          />
          <div className="mt-1 text-xs text-stone-500">
            Geleceğe tarihlerseniz “planlı” kabul edilebilir (API desteğiyle).
          </div>
        </div>
      </div>

      {/* İçerik */}
      <div>
        <label className="text-sm font-medium">İçerik</label>
        <textarea
          className="input mt-1 h-80"
          placeholder="HTML veya markdown içeriği girin (güvenlik için sunucuda sanitize ediliyor)."
          value={d.content || ""}
          onChange={(e) => setD({ ...d, content: e.target.value })}
        />
        <div className="mt-1 text-xs text-stone-500">
          Görselleri içerikte kullanacaksanız yüklediğiniz URL’yi ekleyin.
        </div>
      </div>

      {/* Hata / Aksiyonlar */}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          className="btn btn-primary"
          onClick={onSave}
          disabled={saving}
          type="button"
        >
          {saving ? "Kaydediliyor…" : "Kaydet"}
        </button>
        <button
          className="btn btn-ghost"
          onClick={resetForm}
          type="button"
          disabled={saving}
        >
          Temizle
        </button>
      </div>

      {/* Başarılı modal */}
      {okModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="k-card max-w-md">
            <div className="text-lg font-semibold">Yazı kaydedildi</div>
            <p className="mt-2 text-sm text-stone-700">
              İçerik başarıyla kaydedildi. Ne yapmak istersin?
            </p>
            <div className="mt-5 flex items-center gap-3">
              <button
                className="btn btn-primary"
                onClick={() => router.push(`/blog/${okModal.slug}`)}
              >
                Yazıyı gör
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setOkModal(null);
                  resetForm();
                }}
              >
                Yeni yazı ekle
              </button>
              <button
                className="btn btn-ghost ml-auto"
                onClick={() => setOkModal(null)}
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

