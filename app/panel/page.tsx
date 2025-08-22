import type { Metadata } from "next";
import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Panel — Gönderimler",
  robots: { index: false, follow: false }, // noindex
};

function fmt(ts: number) {
  try {
    return new Date(ts).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });
  } catch {
    return new Date(ts).toLocaleString();
  }
}

export default async function Page() {
  // Upstash unknown[] döndürebilir -> string[]'e çevir
  const idsUnknown = await redis.zrange("fal:index", 0, 199, { rev: true });
  const ids: string[] = (Array.isArray(idsUnknown) ? idsUnknown : []).map((v) => String(v));

  const raw = await Promise.all(
    ids.map(async (id) => {
      const it = await redis.hgetall<Record<string, any>>(`fal:item:${id}`);
      return it ? { id, ...it } : null;
    })
  );

  const rows = raw.filter(
    (r): r is { id: string } & Record<string, any> => r !== null
  );

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Gönderimler</h1>

      <div className="mt-6 overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-stone-50 text-stone-600">
            <tr>
              <th className="px-3 py-2 text-left">Tarih</th>
              <th className="px-3 py-2 text-left">İsim</th>
              <th className="px-3 py-2 text-left">Yaş</th>
              <th className="px-3 py-2 text-left">Cinsiyet</th>
              <th className="px-3 py-2 text-left">Foto</th>
              <th className="px-3 py-2 text-left">Sonuç</th>
              <th className="px-3 py-2 text-left">Sil</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-3 py-2">{fmt(Number(r.createdAt))}</td>
                <td className="px-3 py-2">{r.name || "-"}</td>
                <td className="px-3 py-2">{r.age || "-"}</td>
                <td className="px-3 py-2">{r.gender || "-"}</td>
                <td className="px-3 py-2">{r.photosCount || 0}</td>
                <td className="px-3 py-2">
                  <a className="text-indigo-700 hover:underline" href={`/fal/${encodeURIComponent(r.id)}`}>
                    Görüntüle
                  </a>
                </td>
                <td className="px-3 py-2">
                  <form method="post" action={`/api/panel/delete/${encodeURIComponent(r.id)}`}>
                    <button className="rounded-md border px-2 py-1 hover:bg-stone-50" type="submit">Sil</button>
                  </form>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="px-3 py-8 text-center text-stone-500" colSpan={7}>
                  Henüz kayıt yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <a
          href="/api/panel/export"
          className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-stone-50"
        >
          CSV indir
        </a>
      </div>
    </section>
  );
}
