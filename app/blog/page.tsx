import type { Metadata } from "next";
import { redis } from "@/lib/redis";
import BlogListClient from "@/components/BlogListClient";
import { SITE } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Blog",
  description: "Sanal kahve falı ve online kahve falı üzerine ipuçları, rehberler ve duyurular.",
  alternates: { canonical: "/blog" },
  openGraph: {
    url: "/blog",
    title: "Blog",
    description: "Sanal kahve falı ve online kahve falı üzerine ipuçları, rehberler ve duyurular.",
    images: [{ url: "/resim/sanal-kahve-fali-x2.png" }],
  },
  twitter: {
    title: "Blog",
    description: "Sanal kahve falı ve online kahve falı üzerine ipuçları, rehberler ve duyurular.",
    images: ["/resim/sanal-kahve-fali-x2.png"],
  },
};

type BlogCardPost = {
  slug: string;
  title: string;
  description?: string;
  image?: string;
  createdAt?: string;
};

async function getInitial(limit = 9): Promise<{ items: BlogCardPost[]; nextCursor: number | null }> {
  // DESC: +inf → -inf
  const slugs = (await redis.zrange("blog:index", "+inf" as any, "-inf", {
    byScore: true,
    rev: true,
    offset: 0,
    count: limit,
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
    if (s !== null && s !== undefined) nextCursor = Number(s) - 1;
  }

  return { items, nextCursor };
}

export default async function Page() {
  const { items, nextCursor } = await getInitial(9);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Blog",
    url: `${SITE.url}/blog`,
    description: "Sanal kahve falı ve online kahve falı üzerine ipuçları, rehberler ve duyurular.",
    publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Blog</h1>
        <p className="mt-3 text-stone-700">
          Sanal kahve falı dünyasından rehberler, ipuçları ve haberler.
        </p>
      </div>

      <BlogListClient initialItems={items} initialCursor={nextCursor} />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </section>
  );
}



