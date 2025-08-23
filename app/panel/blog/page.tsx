"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Row = {
  slug: string;
  title: string;
  status: "draft" | "pub" | "scheduled" | string;
  createdAt?: string;
  updatedAt?: string;
  publishAt?: string;
  image?: string;
  description?: string;
};

export default function BlogPanelPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [bulk, setBulk] = useState<"delete" | "publish" | "draft" | "">("");

  async function load() {
    const res = await fetch("/api/panel/blog/admin-list", { cache: "no-store" });
    const json = await res.json();
    setRows(json.items || []);
    setSelected({});
  }

  useEffect(() => { load(); }, []);

  const allChecked = rows.length > 0 && rows.every(r => selected[r.slug]);
  const anyChecked = rows.some(r => selected[r.slug]);

  function toggleAll(val: boolean) {
    const next: Record<string, boolean> = {};
    for (const r of rows) next[r.slug] = val;
    setSelected(next);
  }

  async function doBulk() {
    if (!bulk) return;
    const slugs = rows.filter(r => selected[r.slug]).map(r => r.slug);
    if (slugs.length === 0) return;

    if (bulk === "delete") {
      if (!confirm(`Seçili ${slugs.length} yazı silinsin mi?`)) return;
    }

    const res = await fetch("/api/panel/blog/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: bulk, slugs }),
    });
    const json = await res.json();
    if (!json.ok) {
      alert(json.error || "İşlem başarısız");
      return;
    }
    await load();
    setBulk("");
  }

  function fmt(t?: string) {
    if (!t) return "";
    const n = Number(t);
    if (!Number.isFinite(n)) return "";
    return new Date(n).toLocaleString("tr-TR");
  }

  function StatusChip({ s }: { s: Row["status"] }) {
    const map: Record<string, string> = {
      pub: "bg-green-100 text-green-700",
      draft: "bg-stone-100 text-stone-700",
      scheduled: "bg-amber-100 text-amber-700",
    };
    return <span className={`rounded-full px-2.5 py-1 text-xs ${map[s] || "bg-stone-100 text-stone-700"}`}>{s}</span>;
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Blog Yönetimi</h1>
        <Link href="/panel/blog/yeni" className="btn btn-primary">
          + Yeni Yazı
        </Link>
      </div>

      {/* bulk aksiyon */}
      <div className="mb-3 flex items-center gap-3">
        <select className="input w-56" value={bulk} onChange={(e) => setBulk(e.target.value as any)}>
          <option value="">Toplu işlem seç</option>
          <option value="publish">Yayımla</option>
          <option value="draft">Taslağa al</option>
          <option value="delete">Sil</option>
        </select>
        <button className="btn btn-primary" onClick={doBulk} disabled={!bulk || !anyChecked}>
          Uygula
        </button>
        <div className="text-sm text-stone-600">{anyChecked ? `${Object.values(selected).filter(Boolean).length} seçili` : ""}</div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-stone-200">
        <table className="min-w-full text-sm">
          <thead className="bg-stone-50">
            <tr>
              <th className="p-3 w-12">
                <input type="checkbox" checked={allChecked} onChange={(e) => toggleAll(e.target.checked)} />
              </th>
              <th className="p-3">Başlık</th>
              <th className="p-3">Slug</th>
              <th className="p-3">Durum</th>
              <th className="p-3">Yayımlanma</th>
              <th className="p-3">Güncelleme</th>
              <th className="p-3 w-40">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.slug} className="border-t">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={!!selected[r.slug]}
                    onChange={(e) => setSelected({ ...selected, [r.slug]: e.target.checked })}
                  />
                </td>
                <td className="p-3">
                  <div className="line-clamp-2 font-medium">{r.title}</div>
                  <div className="text-xs text-stone-500 line-clamp-1">{r.description}</div>
                </td>
                <td className="p-3 text-stone-600">{r.slug}</td>
                <td className="p-3"><StatusChip s={r.status} /></td>
                <td className="p-3">{r.publishAt ? fmt(r.publishAt) : r.status === "pub" ? fmt(r.createdAt) : "-"}</td>
                <td className="p-3">{fmt(r.updatedAt)}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <a className="btn btn-ghost" href={`/blog/${r.slug}`} target="_blank" rel="noopener">Görüntüle</a>
                    <Link className="btn btn-ghost" href={`/panel/blog/yeni?edit=${encodeURIComponent(r.slug)}`}>Düzenle</Link>
                    <button
                      className="btn btn-ghost text-red-600"
                      onClick={async () => {
                        if (!confirm(`"${r.title}" silinsin mi?`)) return;
                        await fetch("/api/panel/blog/bulk", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ action: "delete", slugs: [r.slug] }),
                        });
                        load();
                      }}
                    >
                      Sil
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td className="p-6 text-center text-stone-600" colSpan={7}>Henüz içerik yok.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
