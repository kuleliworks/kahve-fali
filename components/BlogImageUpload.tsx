"use client";

import { useRef, useState } from "react";

type Props = {
  onDone: (url: string) => void;
};

export default function BlogImageUpload({ onDone }: Props) {
  const inp = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function handlePick() {
    inp.current?.click();
  }

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;

    setErr(null);
    setLoading(true);

    // küçük önizleme
    const url = URL.createObjectURL(f);
    setPreview(url);

    try {
      const fd = new FormData();
      fd.append("file", f);

      // 30sn timeout
      const ac = new AbortController();
      const t = setTimeout(() => ac.abort(), 30_000);

      const res = await fetch("/api/blog/upload", {
        method: "POST",
        body: fd,
        signal: ac.signal,
      }).catch((e) => {
        throw new Error(e?.name === "AbortError" ? "İstek zaman aşımına uğradı." : "Ağ hatası");
      });

      clearTimeout(t);

      let json: any = null;
      try {
        json = await res.json();
      } catch {
        throw new Error("Sunucudan beklenen yanıt alınamadı.");
      }

      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "Yükleme başarısız.");
      }

      // başarı
      onDone(json.url);
    } catch (e: any) {
      setErr(e?.message || "Yükleme hatası");
      setPreview(null);
    } finally {
      setLoading(false);
      // input'u resetle ki aynı dosyayı tekrar seçebil
      if (inp.current) inp.current.value = "";
    }
  }

  return (
    <div>
      <input
        ref={inp}
        className="sr-only"
        type="file"
        accept="image/*"
        onChange={onChange}
      />

      <button
        type="button"
        onClick={handlePick}
        className="btn btn-ghost"
        disabled={loading}
      >
        {loading ? "Yükleniyor…" : "Öne çıkan görseli yükle"}
      </button>

      {preview && (
        <div className="mt-3 overflow-hidden rounded-xl ring-1 ring-stone-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Önizleme" className="h-40 w-full object-cover" />
        </div>
      )}

      {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
    </div>
  );
}
