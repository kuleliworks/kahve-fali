"use client";
import { useState } from "react";

type Props = {
  value?: string;                 // mevcut görsel (opsiyonel)
  onDone: (url: string) => void;  // upload sonrası dönen public URL
};

export default function BlogImageUpload({ value, onDone }: Props) {
  const [preview, setPreview] = useState<string | undefined>(value);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr(null);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "blog"); // klasör

      const res = await fetch("/api/blog/upload", { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.url) {
        throw new Error(json?.error || "Yükleme başarısız");
      }
      setPreview(json.url);
      onDone(json.url);
    } catch (e: any) {
      setErr(e?.message || "Yükleme hatası");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <input type="file" accept="image/*" onChange={onFile} />
      {busy && <div className="text-sm text-stone-600">Yükleniyor…</div>}
      {err && <div className="text-sm text-red-600">{err}</div>}
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="Öne çıkarılan görsel"
          className="mt-1 h-32 w-56 rounded-lg object-cover ring-1 ring-stone-200"
        />
      )}
    </div>
  );
}
