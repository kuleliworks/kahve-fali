"use client";

import { useState } from "react";

export default function BlogImageUpload({
  value,
  onDone,
}: {
  value?: string;
  onDone: (url: string) => void;
}) {
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
      const res = await fetch("/api/blog/upload", { method: "POST", body: fd });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok || !json?.url) {
        throw new Error(json?.error || "Yükleme başarısız");
      }
      onDone(json.url);
      setPreview(json.url);
    } catch (e: any) {
      setErr(e?.message || "Yükleme hatası");
    } finally {
      setBusy(false);
      // aynı dosyayı tekrar seçebilsin
      e.target.value = "";
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
    </div>
  );
}
