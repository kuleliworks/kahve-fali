import BlogListClient from "@/components/BlogListClient";
import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Blog",
  description: "Sanal Kahve Falı blog yazıları.",
  alternates: { canonical: "/blog" },
};

type BlogCardPost = {
  slug: string;
  title: string;
  description?: string;
  image?: string;
  createdAt?: string;
};

async function getInitial(): Promise<{ items: BlogCardPost[]; nextCursor: number | null }> {
  const limit = 9;
  const slugs = (await redis.zrange("blog:index", 0, limit - 1, { rev: true })) as string[];

  const items: BlogCardPost[] = [];
  for (const slug of slugs) {
    const it = await redis.hgetall<Record<string, string>>(`blog:post:${slug}`);
    if (it && it.status === "pub") {
      items.push({
        slug,
        title: it.title,
        description: it.description || "",
        image: it.image || "",
        createdAt: it.createdAt,
      });
    }
  }
  const nextCursor = items.length === limit ? limit : null;
  return { items, nextCursor };
}

export default async function Page() {
  const { items, nextCursor } = await getInitial();

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Blog</h1>

      {/* Grid + Load More */}
      <BlogListClient initialItems={items} initialCursor={nextCursor} />
    </section>
  );
}
