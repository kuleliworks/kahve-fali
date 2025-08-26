// app/blog/page.tsx
import type { Metadata } from "next";
import BlogListClient from "@/components/BlogListClient";
import { redis } from "@/lib/redis";

export const metadata: Metadata = {
  title: "Blog",
  description: "Sanal Kahve Falı blog yazıları: ipuçları, rehberler ve duyurular.",
  alternates: { canonical: "/blog" },
};

type Card = {
  slug: string;
  title: string;
  description?: string;
  image?: string;
  createdAt?: string;
};

async function getFirstPage(limit: number): Promise<{ items: Card[]; nextCursor: number | null }> {
  // En yeni -> en eski, index bazlı ilk sayfa
  const slugsUnknown = await redis.zrange("blog:index", 0, limit - 1, { rev: true });
  const slugs: string[] = Array.isArray(slugsUnknown) ? slugsUnknown.map(String) : [];

  const items: Card[] = [];
  for (const s of slugs) {
    const it = await redis.hgetall<Record<string, string>>(`blog:post:${s}`);
    if (!it) continue;
    items.push({
      slug: s,
      title: it.title || s,
      description: it.description || "",
      image: it.image || "",
      createdAt: it.createdAt || "",
    });
  }

  // Bir sonraki kayıt var mı?
  const nextProbe = await redis.zrange("blog:index", limit, limit, { rev: true });
  const nextCursor = Array.isArray(nextProbe) && nextProbe.length > 0 ? limit : null;

  return { items, nextCursor };
}

export default async function Page() {
  const limit = 9;
  const { items, nextCursor } = await getFirstPage(limit);

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Blog</h1>
        <p className="mt-3 text-stone-700">
          Güncel yazılar, ipuçları ve duyurular.
        </p>
      </div>

      <BlogListClient initialItems={items} initialCursor={nextCursor} limit={limit} />
    </section>
  );
}
