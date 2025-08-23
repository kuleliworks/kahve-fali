"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeletePostButton({
  slug,
  title,
}: {
  slug: string;
  title?: string;
}) {
  const [busy, setBusy] = useState(false);
  const r = useRouter();

  async function onClick() {
    if (busy) return;
    if (!confirm(`“${title || slug}” yazısını silmek istiyor musun? Bu işlem geri alınamaz.`)) return;

    setBusy(true);
    try {
      const res = await fetch(`/api/blog/delete/${encodeURIComponent(slug)}`, { method: "DELETE" });

      // Güvenli ayrıştırma (metin → JSON denemesi)
      const ct = res.headers.get("content-type") || "";
      const text = await res.text();
      let json: any = null;
      if (ct.includes("application/json")) {
        try { json = text ? JSON.parse(text) : null; } catch {}
      }
      if (!res.ok) {
        const msg = (json && json.error) || text || `Silme hatası (HTTP ${res.status})`;
        throw new Error(msg);
      }

      r.refresh(); // listeyi yenile
    } catch (e: any) {
      alert(e?.message || "Silme sırasında hata oluştu");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="btn btn-ghost text-red-600"
      title="Yazıyı sil"
    >
      {busy ? "Siliniyor…" : "Sil"}
    </button>
  );
}
