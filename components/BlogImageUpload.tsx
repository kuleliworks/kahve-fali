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

    // Vercel serverless için güvenli eşik (büyük dosya 413 verebilir)
    const MAX_CLIENT = 4 * 1024 * 1024; // 4MB
    if (file.size > MAX_CLIENT) {
      setErr("Dosya çok büyük (4MB üstü). Lütfen daha küçük bir görsel yükleyin.");
      return;
    }

    const fd = new FormData();
    fd.append("file", file);
    setBusy(true);
    try {
      const res = await fetch("/api/blog/upload", { method: "POST", body: fd });

      const ct = res.headers.get("content-type") || "";
      const text = await res.text(); // önce düz metin al
      let json: any = null;

      if (ct.includes("application/json")) {
        try {
          json = text ? JSON.parse(text) : null; // boşsa parse etme
        } catch {
          // JSON değilse json null kalsın
        }
      }

      if (!res.ok) {
        const msg = (json && json.error) || text || `Yükleme hatası (HTTP ${res.status})`;
        throw new Error(msg);
      }

      const url = json?.url;
      if (!url) throw new Error("Sunucu görsel URL’i döndürmedi.");
      onChange(url);
    } catch (e: any) {
      setErr(e?.message || "Yükleme sırasında beklenmeyen bir hata oluştu.");
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
