"use client";

import { useCallback, useState } from "react";

type BlogCardPost = {
  slug: string;
  title: string;
  description?: string;
  image?: string;
  createdAt?: string;
};

type Props = {
  initialItems: BlogCardPost[];
  initialCursor: number | null;
  limit?: number; // varsayılan 9
};

export default function BlogListClient({
  initialItems,
  initialCursor,
  limit = 9,
}: Props) {
  const [items, setItems] = useState<BlogCardPost>(() => initialItems || []) as any;
  const [cursor, setCursor] = useState<number | null>(() => initialCursor);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const dedupeAppend = useCallback((prev: BlogCardPost[], next: BlogCardPost[]) => {
    const seen = new Set(prev.map((p) => p.slug));
    const merged = [...prev];
    for (const n of next) {
      if (!n?.slug) continue;
      if (!seen.has(n.slug)) {
        seen.add(n.slug);
        merged.push(n);
      }
    }
    return merged;
  }, []);

  const loadMore = useCallback(async () => {
    if (loading || cursor === null) return;
    try {
      setLoading(true);
      setErr(null);

      const qs = new URLSearchParams();
      qs.set("limit", String(limit));
      qs.set("cursor", String(cursor));

      const res = await fetch(`/api/blog/list?${qs.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const newItems: BlogCardPost[] = Array.isArray(data?.items) ? data.items : [];
      const nextCursor: number | null =
        data?.nextCursor === null || typeof data?.nextCursor === "number"
          ? data.nextCursor
          : null;

      setItems((prev) => dedupeAppend(prev as any, newItems) as any);
      setCursor(nextCursor);
    } catch (e: any) {
      setErr(e?.message || "Yükleme hatası");
    } finally {
      setLoading(false);
    }
  }, [cursor, limit, loading, dedupeAppend]);

  return (
    <div className="mt-10">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(items as any as BlogCardPost[]).map((p) => (
          <article key={p.slug} className="k-card overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {p.image ? (
              <img
                src={p.image}
                alt={p.title}
                className="aspect-[16/9] w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="aspect-[16/9] w-full bg-stone-100" />
            )}
            <div className="mt-3">
              <a href={`/blog/${encodeURIComponent(p.slug)}`} className="block">
                <h3 className="line-clamp-2 text-lg font-semibold">{p.title}</h3>
                {p.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-stone-600">
                    {p.description}
                  </p>
                )}
              </a>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-center">
        {err && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {err}
          </div>
        )}

        {!err && cursor !== null && (
          <button
            onClick={loadMore}
            disabled={loading}
            className="btn btn-primary"
            type="button"
          >
            {loading ? "Yükleniyor…" : "Daha fazla yükle"}
          </button>
        )}

        {!err && cursor === null && (items as any as BlogCardPost[]).length > 0 && (
          <div className="text-sm text-stone-500">Hepsi bu kadar 🎉</div>
        )}
      </div>
    </div>
  );
}
