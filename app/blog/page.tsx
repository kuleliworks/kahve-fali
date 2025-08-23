import type { Metadata } from "next";
import { redis } from "@/lib/redis";
import BlogListClient from "@/components/BlogListClient";
import type { BlogCardPost } from "@/components/BlogCard";

export const metadata: Metadata = {
  title: "Blog",
  description: "Sanal kahve falı ve online kahve falı üzerine içerikler, ipuçları ve duyurular.",
  alternates: { canonical: "/blog" },
};

async function getInitial(): Promise<{ items: BlogCardPost[]; nextCursor: number | null }> {
  const limit = 9;
  const slugs = (await redis.zrange("blog:index", "+inf" as any, "-inf", {
    byScore: true,
    rev: true,
    limit: { offset: 0, count: limit },
  })) as string[];

  const items: BlogCardPost[] = [];
  for (const slug of slugs) {
    const it = await redis.hgetall<Record<string, string>>(`blog:post:${slug}`);
    if (!it || Object.keys(it).length === 0) continue;
    if (it.status && it.status !== "pub") continue;
    items.push({
      slug,
      title: it.title || slug,
      description: it.description || "",
      image: it.image || "",
      createdAt: it.createdAt || "",
    });
  }

  let nextCursor: number | null = null;
  if (slugs.length === limit) {
    const lastSlug = slugs[slugs.length - 1];
    const s = await redis.zscore("blog:index", lastSlug);
    if (s) nextCursor = Number(s) - 1;
  }

  return { items, nextCursor };
}

export default async function Page() {
  const { items, nextCursor } = await getInitial();

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Blog</h1>
        <p className="mt-4 text-stone-700">
          Sanal kahve falı ve online kahve falı hakkında güncel rehberler, ipuçları ve duyurular.
        </p>
      </div>

      <BlogListClient initialItems={items} initialCursor={nextCursor} />
    </section>
  );
}
