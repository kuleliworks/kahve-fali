"use client";

import { useState } from "react";

type Props = {
  onUploaded?: (p: { url: string; key: string }) => void;
};

export default function BlogImageUpload({ onUploaded }: Props) {
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr(null);
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/blog/upload", { method: "POST", body: fd });
      const json = await res.json();

      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "Yükleme başarısız");
      }

      // Önizlemede kırık görünmesin diye public URL’i öne alıyoruz
      const finalPreview = json.publicUrl || json.url || (json.key ? `/media/${json.key}` : "");
      setPreview(finalPreview);
      onUploaded?.({ url: finalPreview, key: json.key || "" });
    } catch (e: any) {
      setErr(e?.message || "Yükleme sırasında bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">Öne çıkarılan görsel</label>
      <input
        type="file"
        accept="image/*"
        onChange={onFileChange}
        className="input"
      />
      {loading && <div className="text-sm text-stone-600">Yükleniyor…</div>}
      {err && <div className="text-sm text-red-600">{err}</div>}
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Önizleme" className="mt-2 h-32 w-56 rounded-lg object-cover ring-1 ring-stone-200" />
      )}
    </div>
  );
}
