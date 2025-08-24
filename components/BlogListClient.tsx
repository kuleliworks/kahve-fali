"use client";

import { useState } from "react";

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
};

export default function BlogListClient({ initialItems, initialCursor }: Props) {
  const [items, setItems] = useState<BlogCardPost[]>(initialItems || []);
  const [cursor, setCursor] = useState<number | null>(initialCursor);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    if (loading || cursor === null) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/blog/list?cursor=${cursor}`, { cache: "no-store" });
      const json = await res.json();
      setItems((prev) => [...prev, ...(json.items || [])]);
      setCursor(json.nextCursor ?? null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <a key={p.slug} href={`/blog/${p.slug}`} className="k-card block hover:shadow-md transition">
            <div className="aspect-[16/9] overflow-hidden rounded-xl bg-stone-100 ring-1 ring-stone-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.image || "/resim/sanal-kahve-fali-x2.png"}
                alt={p.title}
                className="h-full w-full object-contain"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="mt-3 font-medium">{p.title}</div>
            {p.description ? (
              <div className="mt-1 text-sm text-stone-600 line-clamp-2">{p.description}</div>
            ) : null}
          </a>
        ))}
      </div>

      {cursor !== null && (
        <div className="mt-8 flex justify-center">
          <button className="btn btn-primary" onClick={loadMore} disabled={loading}>
            {loading ? "Yükleniyor…" : "Daha Fazla"}
          </button>
        </div>
      )}
    </>
  );
}
