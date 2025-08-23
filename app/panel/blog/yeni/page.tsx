import { Suspense } from "react";
import NewPostClient from "./NewPostClient";

export const dynamic = "force-dynamic"; // SSG yerine dinamik çalış
export const revalidate = 0;            // cache yok

export default function Page() {
  return (
    <Suspense fallback={
      <section className="mx-auto max-w-3xl px-4 py-10">
        <div className="k-card">Yükleniyor…</div>
      </section>
    }>
      <NewPostClient />
    </Suspense>
  );
}
