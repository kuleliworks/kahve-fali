"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import BlogImageUpload from "@/components/BlogImageUpload";

/** ---------- Yardımcılar ---------- */

// Türkçe karakterleri normalize edip güvenli slug üret
function normalizeTr(input: string): string {
  const map: Record<string, string> = {
    ç: "c", ğ: "g", ı: "i", i: "i", İ: "i", ö: "o", ş: "s", ü: "u",
    Ç: "c", Ğ: "g", I: "i", Ö: "o", Ş: "s", Ü: "u",
  };
  return input
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("");
}

function slugify(raw: string): string {
  return normalizeTr(raw)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// fetch + timeout + güvenli JSON
async function fetchJson<T = any>(
  input: RequestInfo,
  init: RequestInit = {},
  timeoutMs = 15000
): Promise<{ ok: boolean; status: number; data: T | null; error?: string }> {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    const res = await fetch(input, { ...init, signal: ctrl.signal, cache: "no-store" });
    const ct = res.headers.get("content-type") || "";
    let data: any = null;

    if (ct.includes("application/json")) {
      try {
        data = await res.json();
      } catch {
        data = null;
      }
    } else {
      // JSON değilse metni alıp hata mesajı çıkar
      const text = await res.text().catch(() => "");
      data = text ? { message: text } : null;
    }

    return { ok: res.ok, status: res.status, data, error: (data as any)?.error };
  } catch (err: any) {
    return { ok: false, status: 0, data: null, error: err?.message || "İstek başarısız" };
  } finally {
    clearTimeout(id);
  }
}

/** ---------- Tipler ---------- */
type Status = "draft" | "pub";

type FormState = {
  title: string;
  slug: string;
  description: string;
  content: string; // HTML ya da düz yazı
  status: Status;
  image?: string; // upload sonucu URL
};

/** ---------- Bileşen ---------- */
export default function NewPostClient() {
  const router = useRouter();

  const [d, setD] = useState<FormState>({
    title: "",
    slug: "",
    description: "",
    content: "",
    status: "draft",
    image: undefined,
  });

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [okSlug, setOkSlug] = useState<string | null>(null); // başarı modalı
  const [showConfirm, setShowConfirm] = useState(false);

  // Başlığa göre slug önerisi (eğer kullanıcı slug alanını elle değiştirmediyse)
  const userTouchedSlug = useRef(false);
  useEffect(() => {
    if (!userTouchedSlug.current) {
      setD((p) => ({ ...p, slug: slugify(p.title || "") }));
    }
  }, [d.title]);

  const valid = useMemo(() => {
    if (!d.title.trim()) return false;
    if (!d.slug.trim()) return false;
    if (!d.description.trim()) return false;
    if (!d.content.trim()) return false;
    // Görsel opsiyonel, istiyorsan zorunlu yap: if (!d.image) return false;
    return true;
  }, [d]);

  // Kaydet
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setErr(null);

    // Basit doğrulama
    if (!valid) {
      setErr("Lütfen zorunlu alanları doldurun.");
      return;
    }

    setSaving(true);
    const body = {
      title: d.title.trim(),
      slug: d.slug.trim(),
      description: d.description.trim(),
      content: d.content, // HTML ya da düz yazı
      status: d.status,
      image: d.image, // varsa gönder
    };

    const { ok, status, data, error } = await fetchJson("/api/blog/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }, 20000);

    setSaving(false);

    if (!ok) {
      if (status === 409) {
        setErr("Bu slug zaten var. Lütfen farklı bir slug girin.");
        return;
      }
      setErr(error || (data as any)?.message || "Kaydetme sırasında bir sorun oluştu.");
      return;
    }

    const savedSlug =
      (data as any)?.slug || d.slug; // API slug döndürmüyorsa formdakini kullan

    // Başarılı — küçük bir modal/alert göster
    setOkSlug(savedSlug);
    setShowConfirm(true);
  };

  // Başarılı modalındaki butonlar
  const goToPost = () => {
    if (!okSlug) return;
    setShowConfirm(false);
    router.push(`/blog/${encodeURIComponent(okSlug)}`);
  };

  const addAnother = () => {
    setShowConfirm(false);
    setD({
      title: "",
      slug: "",
      description: "",
      content: "",
      status: "draft",
      image: undefined,
    });
    userTouchedSlug.current = false;
  };

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Yeni Blog Yazısı</h1>
      <p className="mt-2 text-sm text-stone-600">
        Başlık, açıklama, içerik ve görseli ekleyip yayına alabilirsin. Yayınla yerine taslak olarak da kaydedebilirsin.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-5">
        {/* Başlık */}
        <div>
          <label className="block text-sm font-medium text-stone-700">Başlık *</label>
          <input
            className="input mt-1"
            placeholder="Örn: Kahve Falında Yılan Görmek"
            value={d.title}
            onChange={(e) => setD({ ...d, title: e.target.value })}
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-stone-700">Slug *</label>
          <input
            className="input mt-1"
            placeholder="ornegin-kahve-falinda-yilan-gormek"
            value={d.slug}
            onChange={(e) => {
              userTouchedSlug.current = true;
              setD({ ...d, slug: slugify(e.target.value) });
            }}
          />
          <p className="mt-1 text-xs text-stone-500">
            Bağlantı: <code>/blog/{d.slug || "slug"}</code>
          </p>
        </div>

        {/* Açıklama */}
        <div>
          <label className="block text-sm font-medium text-stone-700">Açıklama (SEO) *</label>
          <textarea
            className="input mt-1 h-24"
            placeholder="Özet/description – 140–160 karakter önerilir."
            value={d.description}
            onChange={(e) => setD({ ...d, description: e.target.value })}
          />
        </div>

        {/* Görsel yükleme */}
        <div>
          <label className="block text-sm font-medium text-stone-700">Öne çıkarılan görsel</label>
          <div className="mt-1">
            <BlogImageUpload
              onDone={(url) => setD({ ...d, image: url })}
            />
          </div>
          {d.image && (
            <div className="mt-3 rounded-xl border border-stone-200 p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={d.image}
                alt="Ön izleme"
                className="h-44 w-full rounded-lg object-cover"
                loading="lazy"
              />
              <div className="mt-2 text-xs text-stone-600 break-all">{d.image}</div>
            </div>
          )}
        </div>

        {/* İçerik */}
        <div>
          <label className="block text-sm font-medium text-stone-700">İçerik *</label>
          <textarea
            className="input mt-1 h-72"
            placeholder="İçerik (HTML veya düz yazı). Basit stiller blog sayfasında otomatik uygulanır."
            value={d.content}
            onChange={(e) => setD({ ...d, content: e.target.value })}
          />
        </div>

        {/* Durum */}
        <div>
          <label className="block text-sm font-medium text-stone-700">Durum</label>
          <select
            className="input mt-1"
            value={d.status}
            onChange={(e) => setD({ ...d, status: (e.target.value as Status) || "draft" })}
          >
            <option value="draft">Taslak</option>
            <option value="pub">Yayınla</option>
          </select>
        </div>

        {/* Hata ve Aksiyonlar */}
        {err && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!valid || saving}
          >
            {saving ? "Kaydediliyor..." : d.status === "pub" ? "Yayınla" : "Taslak olarak kaydet"}
          </button>

          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => router.push("/panel/blog")}
            disabled={saving}
          >
            Listeye dön
          </button>
        </div>
      </form>

      {/* Başarı modalı */}
      {showConfirm && okSlug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="text-lg font-semibold">İşlem başarılı</div>
            <p className="mt-2 text-sm text-stone-700">
              Yazı başarıyla kaydedildi.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button className="btn btn-ghost" onClick={addAnother}>Yeni yazı ekle</button>
              <button className="btn btn-primary" onClick={goToPost}>Yazıyı gör</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
