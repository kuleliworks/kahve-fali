// app/blog/page.tsx
import type { Metadata } from "next";
import { redis } from "@/lib/redis";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog",
  description: "Sanal kahve falı ve online kahve falı hakkında yazılar.",
  alternates: { canonical: "/blog" },
  openGraph: { url: "/blog", title: "Blog", description: "Sanal kahve falı yazıları.", images: [{ url: "/resim/sanal-kahve-fali-x2.png" }] },
  twitter: { title: "Blog", description: "Sanal kahve falı yazıları.", images: ["/resim/sanal-kahve-fali-x2.png"] },
};

type Post = {
  title: string; slug: string; description?: string; image?: string; updatedAt?: string; status?: string;
};

async function getPosts(): Promise<Post[]> {
  const slugs = (await redis.zrange<string>("blog:index", 0, -1, { rev: true })) || [];
  const rows = await Promise.all(
    slugs.map(async (slug) => {
      const it = await redis.hgetall<Record<string, string>>(`blog:post:${slug}`);
      if (!it || it.status !== "pub") return null;
      return {
        title: it.title,
        slug: it.slug,
        description: it.description,
        image: it.image,
        updatedAt: it.updatedAt,
        status: it.status,
      } as Post;
    })
  );
  return rows.filter(Boolean) as Post[];
}

export default async function Page() {
  const posts = await getPosts();
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-center">Blog</h1>
      <p className="mt-3 text-center text-stone-700">Sanal kahve falı hakkında rehberler, ipuçları ve içerikler.</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="k-card block hover:shadow-md transition">
            {p.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.image} alt={p.title} className="mb-3 h-40 w-full rounded-xl object-cover" loading="lazy" />
            )}
            <div className="font-semibold">{p.title}</div>
            {p.description && <div className="mt-1 text-sm text-stone-600 line-clamp-2">{p.description}</div>}
            {p.updatedAt && <div className="mt-2 text-xs text-stone-500">Güncellendi: {new Date(Number(p.updatedAt)).toLocaleDateString("tr-TR")}</div>}
          </Link>
        ))}
        {posts.length === 0 && (
          <div className="k-card">Henüz yayınlanmış yazı yok.</div>
        )}
      </div>
    </section>
  );
}
