import { redis } from "@/lib/redis";
import Link from "next/link";

// Panel listesi her zaman taze olsun
export const revalidate = 0;
export const dynamic = "force-dynamic";

type Row = {
  slug: string;
  title?: string;
  description?: string;
  image?: string;
  status?: "draft" | "pub";
  createdAt?: string; // ms (string)
};

async function getAllRows(): Promise<Row[]> {
  // NOT: Burada generic KULLANMIYORUZ; sonucu string[] olarak cast ediyoruz
  const slugsRaw = await redis.zrange("blog:index", 0, -1, { rev: true } as any);
  const slugs = Array.isArray(slugsRaw) ? (slugsRaw as string[]) : [];

  const rows: Row[] = [];
  for (const slug of slugs) {
    const it = await redis.hgetall<Record<string, string>>(`blog:post:${slug}`);
    if (!it || Object.keys(it).length === 0) continue;
    rows.push({
      slug,
      title: it.title,
      description: it.description,
      image: it.image,
      status: (it.status as any) || "pub",
      createdAt: it.createdAt,
    });
  }
  return rows;
}

function fmtDate(ms?: string) {
  if (!ms) return "-";
  const n = Number(ms);
  if (!Number.isFinite(n)) return "-";
  try {
    return new Date(n).toLocaleString("tr-TR");
  } catch {
    return "-";
  }
}

export default async function Page() {
  const items = await getAllRows();

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Blog Yönetimi</h1>
        <Link href="/panel/blog/yeni" className="btn btn-primary">
          + Yeni Yazı
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="k-card">
          <p>Henüz yazı bulunmuyor.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl ring-1 ring-stone-200">
          <table className="min-w-full divide-y divide-stone-200 bg-white">
            <thead className="bg-stone-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-600">
                  Görsel
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-600">
                  Başlık
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-600">
                  Durum
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-600">
                  Tarih
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-600">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {items.map((it) => (
                <tr key={it.slug} className="hover:bg-stone-50/60">
                  <td className="px-4 py-3">
                    {it.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={it.image}
                        alt=""
                        className="h-12 w-16 rounded-lg object-cover ring-1 ring-stone-200"
                      />
                    ) : (
                      <div className="h-12 w-16 rounded-lg bg-stone-100 ring-1 ring-stone-200" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{it.title || it.slug}</div>
                    <div className="break-all text-xs text-stone-500">/blog/{it.slug}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        it.status === "pub"
                          ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                          : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                      }`}
                    >
                      {it.status === "pub" ? "Yayınlandı" : "Taslak"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-stone-700">{fmtDate(it.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/blog/${it.slug}`} className="btn btn-ghost" title="Görüntüle">
                        Görüntüle
                      </Link>
                      <Link href={`/panel/blog/duzenle/${it.slug}`} className="btn btn-ghost" title="Düzenle">
                        Düzenle
                      </Link>
                      {/* İleride “Sil” eklenecekse burada buton + server action / API çağrısı koyabiliriz */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
