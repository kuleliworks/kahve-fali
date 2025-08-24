import type { Metadata } from "next";
import { Suspense } from "react";
import NewPostClient from "./NewPostClient";

export const metadata: Metadata = {
  title: "Yeni Yazı",
};

export default function Page() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">Yeni Yazı</h1>
      <p className="mt-2 text-stone-600">
        Başlık, kısa açıklama, içerik ve görseli ekleyip yayınlayın.
      </p>

      <div className="k-card mt-6 p-6">
        <Suspense fallback={<div>Yükleniyor…</div>}>
          <NewPostClient />
        </Suspense>
      </div>
    </section>
  );
}
