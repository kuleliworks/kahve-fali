import type { Metadata } from "next";
import NewPostClient from "./NewPostClient";

export const metadata: Metadata = {
  title: "Yeni Blog Yazısı",
  description: "Blog’a yeni yazı ekleyin.",
  alternates: { canonical: "/panel/blog/yeni" },
};

export default function Page() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Yeni Blog Yazısı</h1>
        <p className="mt-1 text-sm text-stone-600">
          Başlık, öne çıkan görsel, açıklama ve içeriği girin. Kaydettikten sonra isterseniz hemen yayınlayabilirsiniz.
        </p>
      </header>
      <div className="k-card">
        <NewPostClient />
      </div>
    </section>
  );
}
