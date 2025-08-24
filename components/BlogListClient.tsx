"use client";

import { useEffect, useState } from "react";

type Post = {
  slug: string;
  title: string;
  description?: string;
  image?: string;
  imageKey?: string;
  createdAt?: string;
};

export default function BlogListClient() {
  const [items, setItems] = useState<Post[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function loadMore() {
    if (loading || done) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/blog/list?offset=${offset}&limit=9`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || "yükleme hatası");

      const news: Post[] = json.items || [];
      setItems(prev => [...prev, ...news]);
      setOffset(prev => prev + news.length);
      if (news.length < 9) setDone(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadMore(); /* ilk sayfa */ }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(p => {
          const src = p.imageKey ? `/media/${p.imageKey}` : (p.image || "/resim/sanal-kahve-fali-x2.png");
          return (
            <article key={p.slug} className="k-card hover:shadow-md transition">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={p.title} className="h-40 w-full rounded-xl object-cover ring-1 ring-stone-200" />
              <h3 className="mt-3 text-lg font-semibold">{p.title}</h3>
              {p.description && <p className="mt-1 text-stone-700 line-clamp-2">{p.description}</p>}
              <a className="btn btn-ghost mt-3" href={`/blog/${p.slug}`}>Oku</a>
            </article>
          );
        })}
      </div>

      {!done && (
        <div className="mt-8 flex justify-center">
          <button className="btn btn-primary" onClick={loadMore} disabled={loading}>
            {loading ? "Yükleniyor…" : "Daha fazla"}
          </button>
        </div>
      )}
    </div>
  );
}
