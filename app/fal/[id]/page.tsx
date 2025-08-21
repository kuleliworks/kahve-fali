import type { Metadata } from "next";
import { decodeId } from "@/lib/id";
import { buildFortune } from "@/lib/fortune";
import ShareButtons from "@/components/ShareButtons";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const data = decodeId(params.id);
  const name = data?.n || "Fal Sonucu";
  return {
    title: `${name} için Fal Sonucu`,
    description: "Sanal kahve falı sonucu.",
    robots: { index: false, follow: true },
  };
}

function capFirst(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

export default async function Page({ params }: { params: { id: string } }) {
  const payload = decodeId(params.id);
  if (!payload) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12">
        <div className="card p-8">
          <h1 className="text-2xl font-bold">Fal Sonucun</h1>
        <p className="mt-2 text-neutral-600">Fal yorumunda beklenmedik bir durum oldu. Lütfen tekrar deneyin.</p>
        </div>
      </section>
    );
  }

  const name = capFirst(payload.n);
  const paragraphs = buildFortune(payload.n, payload.g, payload.a, payload.i);

  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <article className="overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-neutral-200">
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/resim/sanal-kahve-fali-x2.png"
            alt="Kahve Falı"
            className="h-44 w-full object-contain bg-gradient-to-b from-neutral-50 to-white"
          />
        </div>

        <div className="p-6 sm:p-10">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {name} için fal sonucu
          </h1>

          <div className="mt-3 text-sm text-neutral-600">
            Yaş: {payload.a} • {payload.g === "kadin" ? "Kadın" : payload.g === "erkek" ? "Erkek" : "Belirtmedi"}
          </div>

          <div className="mt-6">
            <ShareButtons id={params.id} title={`Fal Sonucu – ${name}`} />
          </div>
        </div>
      </article>

      <div className="mt-10">
        <div className="prose-article prose-h2:mt-8 prose-p:my-5">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>

      <div className="mt-10">
        <ShareButtons id={params.id} title={`Fal Sonucu – ${name}`} />
      </div>
    </section>
  );
}
