"use client";

import { useState } from "react";

type Props = {
  /** Varsa mevcut görsel URL’i (düzenleme ekranında önizleme için) */
  value?: string;
  /** Yükleme başarılı olduğunda üst forma URL’i döner (kendi domainin /media/...) */
  onDone: (url: string) => void;
};

export default function BlogImageUpload({ value, onDone }: Props) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | undefined>(value);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setErr(null);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", f);

      const res = await fetch("/api/blog/upload", {
        method: "POST",
        body: fd,
      });

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok || !(json.publicUrl || json.url)) {
        throw new Error(json?.error || "Yükleme başarısız");
      }

      const final = json.publicUrl || json.url; // kendi domaininden /media/... varsa onu kullan
      onDone(final);
      setPreview(final);
    } catch (e: any) {
      setErr(e?.message || "Yükleme hatası");
    } finally {
      setBusy(false);
      // Aynı dosyayı tekrar seçebilsin
      e.currentTarget.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <label className="cursor-pointer rounded-xl border border-dashed border-stone-300 bg-stone-50 px-4 py-2 text-sm hover:bg-stone-100">
          <input
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="sr-only"
          />
          <i className="fa-regular fa-image mr-2" />
          {busy ? "Yükleniyor…" : "Görsel seç / yükle"}
        </label>

        {preview && (
          <a
            href={preview}
            target="_blank"
            rel="noopener"
            className="text-sm underline underline-offset-4"
          >
            Görseli aç
          </a>
        )}
      </div>

      {preview && (
        <div className="overflow-hidden rounded-xl ring-1 ring-stone-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Önizleme" className="h-40 w-full object-cover" />
        </div>
      )}

      {err && <p className="text-sm text-red-600">{err}</p>}
      <p className="text-xs text-stone-500">
        Desteklenen: JPG/PNG/WebP (öneri ≤ 12MB). Yükleme sonrası URL otomatik eklenir.
      </p>
    </div>
  );
}
