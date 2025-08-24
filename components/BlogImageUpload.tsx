"use client";

import { useRef, useState } from "react";

type Props = {
  onDone: (url: string) => void;
  className?: string;
};

export default function BlogImageUpload({ onDone, className }: Props) {
  const inp = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function upload(file: File) {
    setErr(null);
    setBusy(true);
    try {
      // Basit boyut kontrolü (örn. 15MB)
      const max = 15 * 1024 * 1024;
      if (file.size > max) {
        throw new Error("Dosya çok büyük (maks. 15MB).");
      }

      // Önizleme
      setPreview(URL.createObjectURL(file));

      // Sunucuya multipart gönder
      const fd = new FormData();
      fd.append("file", file);
      fd.append("filename", file.name);

      // 45sn timeout
      const ctrl = new AbortController();
      const to = setTimeout(() => ctrl.abort(), 45000);

      const res = await fetch("/api/blog/upload", {
        method: "POST",
        body: fd,
        signal: ctrl.signal,
      }).catch((e) => {
        throw new Error(e?.name === "AbortError" ? "İstek zaman aşımına uğradı." : "Yükleme başarısız.");
      });

      clearTimeout(to);

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `HTTP ${res.status}`);
      }
      const json = await res.json();
      if (!json?.url) throw new Error("Sunucu geçersiz yanıt verdi.");
      onDone(json.url);
    } catch (e: any) {
      setErr(e?.message || "Yükleme sırasında hata oluştu.");
    } finally {
      setBusy(false);
    }
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) upload(f);
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inp.current?.click()}
          className="btn btn-ghost"
          disabled={busy}
        >
          {busy ? "Yükleniyor…" : "Görsel seç"}
        </button>
        <input
          ref={inp}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onPick}
        />
        {err && <span className="text-sm text-red-600">{err}</span>}
      </div>

      {preview && (
        <div className="mt-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Önizleme"
            className="h-28 w-40 rounded-xl object-cover ring-1 ring-stone-200"
          />
        </div>
      )}
    </div>
  );
}
