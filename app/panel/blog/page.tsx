// app/panel/blog/page.tsx
import Link from "next/link";
import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic";

type Post = {
  title: string;
  slug: string;
  description?: string;
  image?: string;
  content?: string;
  createdAt?: string; // ms
  updatedAt?: string; // ms
  status?: "pub" | "draft";
};

async function getPosts(): Promise<Post[]> {
  // Son eklenenden başla (rev: true)
  const slugs = (await redis.zrange("blog:index", 0, -1, { rev: true })) as unknown as string[];
  const rows = await Promise.all(
    (slugs || []).map(async (slug) => {
      const it = await redis.hgetall<Record<string, string>>(`blog:post:${slug}`);
      if (!it || !it.title) return null;
      return {
        title: it.title,
        slug: it.slug,
        description: it.description,
        image: it.image,
        content: it.content,
        createdAt: it.createdAt,
        updatedAt: it.updatedAt,
        status: (it.status === "draft" ? "draft" : "pub") as "pub" | "draft",
      } as Post;
    })
  );

  return rows.filter((p): p is Post => !!p);
}

export default async function Page() {
  const posts = await getPosts();

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Blog Yönetimi</h1>
        <Link href="/panel/blog/yeni" className="btn btn-primary">
          + Yeni Yazı
        </Link>
      </div>

      <div className="k-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-stone-50 text-stone-600">
              <tr>
                <th className="px-4 py-3">Başlık</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3">Yayın</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-stone-500">
                    Henüz yazı yok. “Yeni Yazı” ile ekleyebilirsin.
                  </td>
                </tr>
              ) : (
                posts.map((p) => {
                  const pubDate = p.createdAt ? new Date(Number(p.createdAt)) : null;
                  return (
                    <tr key={p.slug} className="border-t">
                      <td className="px-4 py-3 font-medium">{p.title}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs ${
                            p.status === "pub"
                              ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                              : "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200"
                          }`}
                        >
                          {p.status === "pub" ? "Yayında" : "Taslak"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {pubDate ? pubDate.toLocaleDateString("tr-TR") : "-"}
                      </td>
                      <td className="px-4 py-3 text-stone-500">{p.slug}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/blog/${p.slug}`}
                            className="btn btn-ghost"
                            prefetch={false}
                            target="_blank"
                          >
                            Görüntüle
                          </Link>
                          {/* İleride düzenleme/del ekleyebiliriz */}
                          <Link
                            href={`/panel/blog/yeni?prefill=${encodeURIComponent(p.slug)}`}
                            className="btn btn-ghost"
                            prefetch={false}
                          >
                            Kopyala & Yeni
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
