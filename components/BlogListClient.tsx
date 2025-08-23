"use client";

import { useState } from "react";
import BlogCard, { type BlogCardPost } from "@/components/BlogCard";

export default function BlogListClient({
  initialItems,
  initialCursor,
}: {
  initialItems: BlogCardPost[];
  initialCursor: number | null;
}) {
  const [items, setItems] = useState<BlogCardPost[]>(initialItems);
  const [cursor, setCursor] = useState<number | null>(initialCursor);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function loadMore() {
    if (!cursor || busy) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/api/blog/list?cursor=${cursor}&limit=9`, { cache: "no-store" });
      const ct = res.headers.get("content-type") || "";
      const text = await res.text();
      let json: any = null;
      if (ct.includes("application/json")) {
        try { json = text ? JSON.parse(text) : null; } catch {}
      }
      if (!res.ok) throw new Error((json && json.error) || text || `Hata (HTTP ${res.status})`);

      const more: BlogCardPost[] = json?.items || [];
      setItems((prev) => [...prev, ...more]);
      setCursor(json?.nextCursor ?? null);
    } catch (e: any) {
      setErr(e?.message || "Liste yüklenemedi");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => <BlogCard key={p.slug} post={p} />)}
      </div>

      {err && <div className="mt-4 text-sm text-red-600">{err}</div>}

      <div className="mt-8 flex justify-center">
        {cursor ? (
          <button className="btn btn-primary" onClick={loadMore} disabled={busy}>
            {busy ? "Yükleniyor…" : "Daha fazla göster"}
          </button>
        ) : (
          <div className="text-sm text-stone-500">Tüm yazılar yüklendi.</div>
        )}
      </div>
    </>
  );
}
