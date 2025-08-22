// app/panel/blog/page.tsx
"use client";
import { useEffect, useMemo, useState } from "react";

type Post = {
  title: string; slug: string; description?: string; image?: string; content?: string; status: "draft" | "pub";
  createdAt?: string; updatedAt?: string;
};

export default function BlogAdminPage() {
  const [key, setKey] = useState<string>("");
  const [list, setList] = useState<Post[]>([]);
  const [editing, setEditing] = useState<Post | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const k = sessionStorage.getItem("panelKey") || "";
    setKey(k);
    fetchList();
  }, []);

  async function fetchList() {
    const res = await fetch("/api/blog/list", { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    setList(Array.isArray(data?.items) ? data.items : []);
  }

  function startNew() {
    setEditing({ title: "", slug: "", description: "", image: "", content: "", status: "draft" });
  }

  async function save() {
    if (!editing) return;
    setLoading(true); setMsg(null);
    const res = await fetch("/api/blog/upsert", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-panel-key": key || "" },
      body: JSON.stringify(editing),
    });
    const j = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) { setMsg(j?.error || "Kaydetmede hata"); return; }
    setMsg("Kaydedildi");
    setEditing(null);
    sessionStorage.setItem("panelKey", key || "");
    await fetchList();
  }

  async function del(slug: string) {
    if (!confirm("Silinsin mi?")) return;
    const res = await fetch(`/api/blog/delete/${encodeURIComponent(slug)}`, {
      method: "POST",
      headers: { "x-panel-key": key || "" },
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) { alert(j?.error || "Silmede hata"); return; }
    await fetchList();
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-4 flex items-center gap-2">
        <input className="input" placeholder="Panel Key" value={key} onChange={(e) => setKey(e.target.value)} />
        <button className="btn btn-primary" onClick={() => sessionStorage.setItem("panelKey", key || "")}>Anahtarı Kaydet</button>
        <button className="btn btn-primary" onClick={startNew}>Yeni Yazı</button>
      </div>

      {editing && (
        <div className="k-card mb-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="input" placeholder="Başlık" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            <input className="input" placeholder="Slug (boş bırakırsan otomatik)"
              value={editing.slug || ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
            <input className="input sm:col-span-2" placeholder="Öne çıkarılan görsel URL (opsiyonel)"
              value={editing.image || ""} onChange={(e) => setEditing({ ...editing, image: e.target.value })} />
            <input className="input sm:col-span-2" placeholder="Kısa açıklama (description)"
              value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            <select className="input" value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as any })}>
              <option value="draft">Taslak</option>
              <option value="pub">Yayınla</option>
            </select>
          </div>
          <div className="mt-3">
            <textarea className="input h-64" placeholder="İçerik (düz yazı/markdown)"
              value={editing.content || ""} onChange={(e) => setEditing({ ...editing, content: e.target.value })} />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button className="btn btn-primary" onClick={save} disabled={loading}>{loading ? "Kaydediliyor..." : "Kaydet"}</button>
            <button className="btn btn-ghost" onClick={() => setEditing(null)}>Vazgeç</button>
            {msg && <span className="text-sm text-stone-600">{msg}</span>}
          </div>
        </div>
      )}

      <div className="k-card">
        <div className="mb-3 font-semibold">Yazılar</div>
        <div className="divide-y divide-stone-200">
          {list.map((p) => (
            <div key={p.slug} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-medium">{p.title} {p.status !== "pub" && <span className="ml-2 text-xs text-stone-500">(taslak)</span>}</div>
                <div className="text-xs text-stone-500">{p.slug}</div>
              </div>
              <div className="flex gap-2">
                <button className="btn btn-ghost" onClick={() => setEditing(p)}>Düzenle</button>
                <button className="btn btn-ghost" onClick={() => del(p.slug)}>Sil</button>
                {p.status === "pub" && <a className="btn btn-primary" href={`/blog/${p.slug}`} target="_blank" rel="noreferrer">Görüntüle</a>}
              </div>
            </div>
          ))}
          {list.length === 0 && <div className="py-6 text-sm text-stone-500">Henüz yazı yok.</div>}
        </div>
      </div>
    </section>
  );
}
