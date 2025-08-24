import type { Metadata } from "next";
import { redis } from "@/lib/redis";
import BlogTableClient from "./BlogTableClient";

export const metadata: Metadata = { title: "Blog Yönetimi" };

// Panel her açılışta güncel veriyi alsın
export const revalidate = 0;
export const dynamic = "force-dynamic";

type Row = {
  slug: string;
  title: string;
  status?: string;
  createdAt?: string;
  image?: string;
};

export default async function Page() {
  // ZSET: "blog:index" -> slug’lar (yeni -> eski)
  const slugs = (await redis.zrange("blog:index", 0, -1, { rev: true })) as string[];

  const rows: Row[] = [];
  for (const slug of slugs) {
    const it = await redis.hgetall<Record<string, string>>(`blog:post:${slug}`);
    if (!it) continue;
    rows.push({
      slug,
      title: it.title || slug,
      status: it.status || "draft",
      createdAt: it.createdAt,
      image: it.image,
    });
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold">Blog Yönetimi</h1>
      <p className="mt-2 text-stone-600">
        Yazıları görüntüle, düzenle, tekil ya da toplu sil.
      </p>

      <div className="k-card mt-6 overflow-x-auto p-0">
        <BlogTableClient items={rows} />
      </div>
    </section>
  );
}
