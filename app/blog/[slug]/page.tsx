import type { Metadata } from "next";
import { redis } from "@/lib/redis";
import sanitizeHtml, { IOptions } from "sanitize-html";
import Link from "next/link";

type Post = {
  title: string;
  description?: string;
  image?: string;
  imageKey?: string;
  content?: string;
  status?: "draft" | "pub";
  createdAt?: string;
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const it = await redis.hgetall<Record<string,string>>(`blog:post:${slug}`);
  const title = it?.title || slug;
  const desc  = it?.description || "Sanal Kahve Falı blog yazısı";
  const imageKey = it?.imageKey || "";
  const image = imageKey ? `${process.env.NEXT_PUBLIC_BASE_URL || ""}/media/${imageKey}` : (it?.image || "/resim/sanal-kahve-fali-x2.png");

  return {
    title,
    description: desc,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: { title, description: desc, images: [{ url: image }] },
    twitter: { title, description: desc, images: [image] },
  };
}

// HTML sanitize seçenekleri
const CLEAN_OPTS: IOptions = {
  allowedTags: [
    "p","h1","h2","h3","h4","strong","em","u","s","a","ul","ol","li",
    "blockquote","code","pre","hr","br","img","figure","figcaption",
    "table","thead","tbody","tr","th","td"
  ],
  allowedAttributes: {
    a: ["href","title","rel","target"],
    img: ["src","alt","title","width","height","loading"],
    "*": ["class","id","style"]
  },
  allowedSchemes: ["http","https","mailto"],
  transformTags: {
    a: (tag, attribs) => ({ tagName: "a", attribs: { ...attribs, rel: "nofollow noopener", target: "_blank" } }),
    img: (_tag, attribs) => {
      const src = attribs.src || "";
      return { tagName: "img", attribs: { ...attribs, src, loading: attribs.loading || "lazy" } };
    }
  }
};

async function getRelated(currentSlug: string, take = 3) {
  const slugs = await redis.zrange<string[]>("blog:index", 0, -1, { rev: true });
  const others = (slugs || []).filter(s => s !== currentSlug).slice(0, take);
  const rows = await Promise.all(others.map(async (s) => {
    const it = await redis.hgetall<Record<string,string>>(`blog:post:${s}`);
    if (!it || it.status !== "pub") return null;
    return {
      slug: s,
      title: it.title || s,
      imageKey: it.imageKey || "",
      image: it.image || "",
    };
  }));
  return rows.filter(Boolean) as Array<{slug:string; title:string; imageKey?:string; image?:string;}>;
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const it = await redis.hgetall<Record<string,string>>(`blog:post:${slug}`);
  if (!it || it.status !== "pub") {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold">Yazı bulunamadı</h1>
        <p className="mt-2 text-stone-700">Aradığınız içerik yayında değil veya kaldırılmış olabilir.</p>
        <Link className="btn btn-primary mt-6" href="/blog">Blog’a dön</Link>
      </section>
    );
  }

  const heroSrc = it.imageKey ? `/media/${it.imageKey}` : (it.image || "/resim/sanal-kahve-fali-x2.png");
  const html = sanitizeHtml(it.content || "", CLEAN_OPTS);
  const dateStr = it.createdAt ? new Date(it.createdAt).toLocaleDateString("tr-TR") : "";

  const related = await getRelated(slug, 3);

  return (
    <section className="mx-auto max-w-3xl px-4 py-10 lg:max-w-4xl">
      {/* Breadcrumb */}
      <nav className="text-sm text-stone-600">
        <Link href="/" className="hover:underline">Ana sayfa</Link> <span>›</span>{" "}
        <Link href="/blog" className="hover:underline">Blog</Link> <span>›</span>{" "}
        <span className="text-stone-900">{it.title || slug}</span>
      </nav>

      {/* Başlık */}
      <header className="mt-4">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{it.title || slug}</h1>
        {dateStr && <div className="mt-2 text-sm text-stone-600">{dateStr}</div>}
      </header>

      {/* Hero */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={heroSrc} alt={it.title || slug} className="mt-6 h-64 w-full rounded-2xl object-cover ring-1 ring-stone-200" />

      {/* İçerik */}
      <article className="prose-article k-card mt-6" dangerouslySetInnerHTML={{ __html: html }} />

      {/* Benzer yazılar */}
      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Benzer yazılar</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map(r => {
              const src = r.imageKey ? `/media/${r.imageKey}` : (r.image || "/resim/sanal-kahve-fali-x2.png");
              return (
                <Link key={r.slug} href={`/blog/${r.slug}`} className="k-card hover:shadow-md transition">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={r.title} className="h-28 w-full rounded-xl object-cover ring-1 ring-stone-200" />
                  <div className="mt-2 font-medium line-clamp-2">{r.title}</div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </section>
  );
}
