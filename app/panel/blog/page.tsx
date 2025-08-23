import Link from "next/link";
import DeletePostButton from "@/components/DeletePostButton";
import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic"; // her ziyaretimde KV'den güncel liste çek
export const revalidate = 0;

type PostRow = {
  title: string;
  slug: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  image?: string;
  description?: string;
};

async function getPosts(): Promise<PostRow[]> {
  // blog:index zset → en yeniler başta
  const slugs = (await redis.zrange("blog:index", 0, -1, { rev: true })) as string[];

  const rows = await Promise.all(
    slugs.map(async (slug) => {
      const it = await redis.hgetall<Record<string, string>>(`blog:post:${slug}`);
      if (!it || Object.keys(it).length === 0) return null;
      return {
        title: it.title || slug,
        slug,
        status: it.status || "pub",
        createdAt: it.createdAt || "",
        updatedAt: it.updatedAt || "",
        image: it.image || "",
        description: it.description || "",
      } as PostRow;
    })
  );

  return rows.filter((r): r is PostRow => !!r);
}

export default async function Page() {
  const posts = await getPosts();

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Blog — Yönetim</h1>
        <Link href="/panel/blog/yeni" className="btn btn-primary">
          Yeni Yazı
        </Link>
      </div>

      <div className="k-card mt-6 overflow-hidden">
        {posts.length === 0 ? (
          <div className="p-6 text-sm text-stone-600">
            Henüz yazı yok. İlk yazını eklemek için sağ üstteki <strong>Yeni Yazı</strong> butonunu kullan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left font-medium text-stone-700">Başlık</th>
                  <th className="px-4 py-3 text-left font-medium text-stone-700">Slug</th>
                  <th className="px-4 py-3 text-left font-medium text-stone-700">Durum</th>
                  <th className="px-4 py-3 text-left font-medium text-stone-700">Oluşturma</th>
                  <th className="px-4 py-3 text-left font-medium text-stone-700">Güncelleme</th>
                  <th className="px-4 py-3 text-left font-medium text-stone-700">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {posts.map((p) => (
                  <tr key={p.slug}>
                    <td className="px-4 py-3">{p.title}</td>
                    <td className="px-4 py-3 text-stone-600">{p.slug}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          p.status === "draft"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {p.status === "draft" ? "Taslak" : "Yayında"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {p.createdAt ? new Date(Number(p.createdAt)).toLocaleString("tr-TR") : "-"}
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {p.updatedAt ? new Date(Number(p.updatedAt)).toLocaleString("tr-TR") : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/blog/${p.slug}`}
                          className="btn btn-ghost"
                          prefetch={false}
                          target="_blank"
                        >
                          Görüntüle
                        </Link>

                        <Link
                          href={`/panel/blog/yeni?prefill=${encodeURIComponent(p.slug)}`}
                          className="btn btn-ghost"
                          prefetch={false}
                        >
                          Kopyala & Yeni
                        </Link>

                        <DeletePostButton slug={p.slug} title={p.title} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
