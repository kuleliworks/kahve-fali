"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deletePosts } from "./actions";

type Item = {
  slug: string;
  title: string;
  status?: string;
  createdAt?: string;
  image?: string;
};

export default function BlogTableClient({ items }: { items: Item[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [pending, startTransition] = useTransition();
  const anySelected = useMemo(
    () => Object.values(selected).some(Boolean),
    [selected]
  );

  function toggle(slug: string, v?: boolean) {
    setSelected((s) => ({ ...s, [slug]: v ?? !s[slug] }));
  }
  function toggleAll(v: boolean) {
    const next: Record<string, boolean> = {};
    for (const it of items) next[it.slug] = v;
    setSelected(next);
  }

  async function onBulkDelete() {
    const slugs = Object.entries(selected)
      .filter(([, v]) => v)
      .map(([k]) => k);
    if (slugs.length === 0) return;
    if (!confirm(`${slugs.length} yazıyı silmek istiyor musun?`)) return;

    startTransition(async () => {
      await deletePosts(slugs);
      setSelected({});
      router.refresh();
    });
  }

  async function onDeleteOne(slug: string) {
    if (!confirm(`"${slug}" silinsin mi?`)) return;
    startTransition(async () => {
      await deletePosts([slug]);
      router.refresh();
    });
  }

  return (
    <div className="p-4">
      {/* Top bar */}
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm text-stone-600">
          Toplam {items.length} kayıt
          {anySelected ? ` — Seçili: ${Object.values(selected).filter(Boolean).length}` : ""}
        </div>
        <div className="flex items-center gap-2">
          <a href="/panel/blog/yeni" className="btn btn-primary">Yeni Yazı</a>
          <button
            className="btn btn-ghost"
            onClick={() => toggleAll(true)}
            type="button"
          >
            Tümünü Seç
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => toggleAll(false)}
            type="button"
          >
            Seçimi Kaldır
          </button>
          <button
            className="btn btn-ghost text-red-600"
            onClick={onBulkDelete}
            disabled={!anySelected || pending}
            type="button"
          >
            {pending ? "Siliniyor…" : "Toplu Sil"}
          </button>
        </div>
      </div>

      {/* Tablo */}
      <table className="min-w-full text-sm">
        <thead className="bg-stone-50 text-left">
          <tr>
            <th className="w-10 px-3 py-2">
              <input
                type="checkbox"
                aria-label="Tümünü seç"
                onChange={(e) => toggleAll(e.currentTarget.checked)}
                checked={
                  items.length > 0 &&
                  items.every((it) => selected[it.slug])
                }
              />
            </th>
            <th className="px-3 py-2">Başlık</th>
            <th className="px-3 py-2">Slug</th>
            <th className="px-3 py-2">Durum</th>
            <th className="px-3 py-2">Tarih</th>
            <th className="px-3 py-2 text-right">İşlemler</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {items.map((it) => (
            <tr key={it.slug} className="hover:bg-stone-50">
              <td className="px-3 py-2">
                <input
                  type="checkbox"
                  checked={!!selected[it.slug]}
                  onChange={(e) => toggle(it.slug, e.currentTarget.checked)}
                  aria-label={`Seç: ${it.slug}`}
                />
              </td>
              <td className="px-3 py-2">
                <div className="font-medium">{it.title}</div>
                {it.image ? (
                  <div className="mt-1 text-xs text-stone-500 truncate max-w-[280px]">
                    {it.image}
                  </div>
                ) : null}
              </td>
              <td className="px-3 py-2 text-stone-600">/blog/{it.slug}</td>
              <td className="px-3 py-2">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                    (it.status || "draft") === "pub"
                      ? "bg-green-100 text-green-700"
                      : "bg-stone-100 text-stone-700"
                  }`}
                >
                  {it.status || "draft"}
                </span>
              </td>
              <td className="px-3 py-2 text-stone-600">
                {it.createdAt ? new Date(it.createdAt).toLocaleString("tr-TR") : "-"}
              </td>
              <td className="px-3 py-2">
                <div className="flex items-center justify-end gap-2">
                  <a className="btn btn-ghost" href={`/blog/${it.slug}`} target="_blank" rel="noreferrer">
                    Gör
                  </a>
                  <a className="btn btn-ghost" href={`/panel/blog/yeni?edit=${encodeURIComponent(it.slug)}`}>
                    Düzenle
                  </a>
                  <button
                    className="btn btn-ghost text-red-600"
                    onClick={() => onDeleteOne(it.slug)}
                    disabled={pending}
                    type="button"
                  >
                    Sil
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={6} className="px-3 py-6 text-center text-stone-500">
                Henüz yazı yok.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
