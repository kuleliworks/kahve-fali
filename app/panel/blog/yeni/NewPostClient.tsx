"use client";

import { useState } from "react";
import BlogImageUpload from "@/components/BlogImageUpload";
import { useRouter } from "next/navigation";

function slugify(input: string) {
  const map: Record<string,string> = {
    "ı":"i","İ":"i","ğ":"g","Ğ":"g","ü":"u","Ü":"u","ş":"s","Ş":"s","ö":"o","Ö":"o","ç":"c","Ç":"c",
  };
  const tr = input.split("").map(ch => map[ch] ?? ch).join("");
  return tr
    .toLowerCase()
    .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function NewPostClient() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"draft" | "pub">("draft");

  // Görsel için hem public önizleme (imageUrl) hem de /media key (imageKey)
  const [imageUrl, setImageUrl] = useState("");
  const [imageKey, setImageKey] = useState("");

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<{slug: string} | null>(null);

  const router = useRouter();
  const finalSlug = slug || slugify(title);

  async function onSubmit() {
    setErr(null);
    if (!title || !finalSlug) {
      setErr("Başlık ve slug zorunlu.");
      return;
    }
    setBusy(true);
    try {
      const body = JSON.stringify({
        title,
        slug: finalSlug,
        description,
        image: imageUrl, // fallback tam URL
        imageKey,        // /media için key
        content,
        status
      });

      const res = await fetch("/api/blog/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(json?.error || "Kayıt başarısız");

      setDone({ slug: finalSlug });
    } catch (e: any) {
      setErr(e?.message || "Bir hata oluştu");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">Yeni Yazı</h1>

      <div className="mt-4 grid gap-4">
        <input
          className="input"
          placeholder="Başlık"
          value={title}
          onChange={(e)=>setTitle(e.target.value)}
        />

        <input
          className="input"
          placeholder="Slug (opsiyonel)"
          value={slug}
          onChange={(e)=>setSlug(slugify(e.target.value))}
        />

        <textarea
          className="input h-28"
          placeholder="Kısa açıklama"
          value={description}
          onChange={(e)=>setDescription(e.target.value)}
        />

        {/* Görsel yükleme */}
        <BlogImageUpload
          onUploaded={({ url, key }) => { setImageUrl(url); setImageKey(key); }}
        />

        <div className="mt-2">
          <label className="block text-sm font-medium">Durum</label>
          <select
            className="input"
            value={status}
            onChange={(e)=>setStatus(e.target.value as any)}
          >
            <option value="draft">Taslak</option>
            <option value="pub">Yayınla</option>
          </select>
        </div>

        <textarea
          className="input h-64"
          placeholder="İçerik (HTML veya markdown — tekil sayfada sanitize edilecek)"
          value={content}
          onChange={(e)=>setContent(e.target.value)}
        />

        {err && <div className="text-sm text-red-600">{err}</div>}

        {!done ? (
          <div className="flex gap-3">
            <button className="btn btn-primary" onClick={onSubmit} disabled={busy}>
              {busy ? "Kaydediliyor…" : "Kaydet"}
            </button>
            <button className="btn btn-ghost" onClick={()=>router.push("/panel/blog")}>Panele dön</button>
          </div>
        ) : (
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4">
            <div className="font-medium">İçerik kaydedildi.</div>
            <div className="mt-3 flex gap-3">
              <a className="btn btn-primary" href={`/blog/${done.slug}`}>Yazıyı Gör</a>
              <button
                className="btn btn-ghost"
                onClick={()=>{
                  setTitle(""); setSlug(""); setDescription(""); setContent("");
                  setImageUrl(""); setImageKey(""); setStatus("draft"); setDone(null);
                }}
              >
                Yeni Yazı Ekle
              </button>
              <a className="btn btn-ghost" href="/panel/blog">Panele Dön</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
