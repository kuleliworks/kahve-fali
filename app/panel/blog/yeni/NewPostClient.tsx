"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BlogImageUpload from "@/components/BlogImageUpload";

function slugifyTr(input: string) {
  const map: Record<string, string> = {
    ç: "c", ğ: "g", ı: "i", i: "i", İ: "i", ö: "o", ş: "s", ü: "u",
    Ç: "c", Ğ: "g", I: "i", Ö: "o", Ş: "s", Ü: "u",
  };
  const norm = input.split("").map((ch) => map[ch] ?? ch).join("");
  return norm
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type PostDraft = {
  title: string;
  slug: string;
  description: string;
  content: string;
  status: "draft" | "pub";
  image?: string;
};

export default function NewPostClient() {
  const router = useRouter();
  const sp = useSearchParams();

  const initTitle = sp.get("title") || "";
  const initSlug = sp.get("slug") || "";

  const [d, setD] = useState<PostDraft>({
    title: initTitle,
    slug: initSlug ? slugifyTr(initSlug) : "",
    description: "",
    content: "",
    status: "pub",
    image: undefined,
  });

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const suggestedSlug = useMemo(
    () => (d.title ? slugifyTr(d.title) : ""),
    [d.title]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setErr(null);
    setMsg(null);
    setSaving(true);

    try {
      const title = d.title.trim();
      const slug = (d.slug || suggestedSlug).trim();
      const description = d.description.trim();
      const content = d.content.trim();
      const status = d.status;
      const image = d.image || "";

      if (!title || !slug || !description || !content) {
        throw new Error("Zorunlu alanlar: Başlık, Slug, Açıklama, İçerik");
      }

      // Kasıtsız abort’ları tetiklememek için AbortController/timeout YOK.
      const res = await fetch("/api/blog/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        keepalive: true,
        body: JSON.stringify({ title, slug, description, content, status, image }),
      });

      const raw = await res.text();
      let json: any;
      try {
        json = JSON.parse(raw);
      } catch {
        throw new Error(`Geçersiz yanıt: ${raw.slice(0, 200)}`);
      }

      if (!res.ok || !json?.ok) {
        if (res.status === 409) {
          throw new Error("Bu slug zaten var. Lütfen farklı bir bağlantı deneyin.");
        }
        throw new Error(json?.error || `İstek başarısız (HTTP ${res.status})`);
      }

      setMsg("İçerik kaydedildi.");

      const go = confirm("İçerik kaydedildi. Yazıyı görüntülemek ister misiniz?");
      if (go) {
        router.push(`/blog/${encodeURIComponent(json.slug)}`);
      } else {
        setD({
          title: "",
          slug: "",
          description: "",
          content: "",
          status: "pub",
          image: undefined,
        });
      }
    } catch (e: any) {
      const m =
        e?.name === "AbortError"
          ? "İstek iptal edildi. Tekrar deneyin."
          : e?.message || "Bilinmeyen bir hata.";
      setErr(m);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Yeni Blog Yazısı</h1>
      <p className="mt-2 text-sm text-stone-600">
        Zorunlu: Başlık, Slug, Açıklama, İçerik. “Yayınla” seçilirse /blog listesine düşer.
      </p>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium">Başlık</label>
          <input
            className="input mt-1"
            value={d.title}
            onChange={(e) => setD({ ...d, title: e.target.value })}
            placeholder="Örn: Kahve Falında Yılan Görmek"
          />
          {d.title && (
            <div className="mt-1 text-xs text-stone-500">
              Önerilen slug: <code>{suggestedSlug}</code>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Slug (bağlantı)</label>
          <input
            className="input mt-1"
            value={d.slug}
            onChange={(e) => setD({ ...d, slug: slugifyTr(e.target.value) })}
            onBlur={() => {
              if (!d.slug && suggestedSlug) setD({ ...d, slug: suggestedSlug });
            }}
            placeholder="ornegin-kahve-falinda-yilan-gormek"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Açıklama (meta description)</label>
          <input
            className="input mt-1"
            value={d.description}
            onChange={(e) => setD({ ...d, description: e.target.value })}
            placeholder="150–160 karakterlik özet."
            maxLength={220}
          />
          <div className="mt-1 text-xs text-stone-500">
            {d.description.length} karakter
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Öne çıkarılan görsel</label>
          <div className="mt-1">
            <BlogImageUpload onDone={(url) => setD({ ...d, image: url })} />
          </div>
          {d.image && (
            <div className="mt-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={d.image}
                alt="Önizleme"
                className="h-40 w-full rounded-lg object-cover ring-1 ring-stone-200"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">İçerik</label>
          <textarea
            className="input mt-1 h-64"
            value={d.content}
            onChange={(e) => setD({ ...d, content: e.target.value })}
            placeholder="HTML veya düz yazı/markdown"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Durum</label>
          <select
            className="input mt-1"
            value={d.status}
            onChange={(e) => setD({ ...d, status: e.target.value as "draft" | "pub" })}
          >
            <option value="pub">Yayınla</option>
            <option value="draft">Taslak</option>
          </select>
        </div>

        {err && <p className="text-sm text-red-600">{err}</p>}
        {msg && <p className="text-sm text-emerald-600">{msg}</p>}

        <button
          type="submit"
          disabled={saving}
          className="btn btn-primary disabled:opacity-60"
        >
          {saving ? "Kaydediliyor…" : "Kaydet"}
        </button>
      </form>
    </div>
  );
}
