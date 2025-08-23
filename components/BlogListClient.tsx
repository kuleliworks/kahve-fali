"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export type BlogCardPost = {
  slug: string;
  title: string;
  description?: string;
  image?: string;
  createdAt?: string;
};

export default function BlogListClient({
  initialItems,
  initialCursor,
}: {
  initialItems: BlogCardPost[];
  initialCursor: number | null;
}) {
  const [items, setItems] = useState<BlogCardPost[]>(initialItems || []);
  const [cursor, setCursor] = useState<number | null>(initialCursor ?? null);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    if (loading || cursor === null) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/blog/list?cursor=${cursor}&limit=9`, { cache: "no-store" });
      const json = await res.json();
      if (Array.isArray(json.items)) {
        setItems((prev) => [...prev, ...json.items]);
      }
      setCursor(json.nextCursor ?? null);
    } catch {
      // sessizce yut
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-10">
      {/* Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <article key={p.slug} className="k-card overflow-hidden">
            <Link href={`/blog/${p.slug}`}>
              {p.image ? (
                <div className="relative h-44 w-full overflow-hidden rounded-xl">
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    className="object-cover"
                    sizes="(max-width:768px) 100vw, 33vw"
                  />
                </div>
              ) : null}
              <div className="mt-3">
                <h3 className="line-clamp-2 text-lg font-semibold">{p.title}</h3>
                {p.description ? (
                  <p className="mt-2 line-clamp-3 text-sm text-stone-700">{p.description}</p>
                ) : null}
              </div>
            </Link>
          </article>
        ))}
      </div>

      {/* Load more */}
      {cursor !== null && (
        <div className="mt-8 text-center">
          <button
            className="btn btn-primary"
            onClick={loadMore}
            disabled={loading}
            type="button"
          >
            {loading ? "Yükleniyor…" : "Daha fazla yükle"}
          </button>
        </div>
      )}
    </div>
  );
}
