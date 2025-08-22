"use client";

import { useState } from "react";

export default function BlogImageUpload({
  value,
  onChange,
}: {
  value?: string;
  onChange: (url: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    setErr(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("file", file);
    setBusy(true);
    try {
      const res = await fetch("/api/blog/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Yükleme başarısız.");
      onChange(json.url); // formdaki image alanına URL yaz
    } catch (e: any) {
      setErr(e?.message || "Yükleme hatası");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">Öne çıkarılan görsel</label>
      <input
        type="file"
        accept="image/*"
        onChange={onFileSelect}
        disabled={busy}
        className="block w-full text-sm"
      />
      {busy && <div className="text-sm text-stone-500">Yükleniyor…</div>}
      {err && <div className="text-sm text-red-600">{err}</div>}
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt="Önizleme"
          className="mt-2 h-40 w-auto rounded-xl border object-cover"
        />
      )}
    </div>
  );
}
