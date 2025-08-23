import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { redis } from "@/lib/redis";
import { SITE } from "@/lib/seo";

export const revalidate = 600; // 10 dk

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const slug = decodeURIComponent(params?.slug || "");
  const post = await redis.hgetall<Record<string, string>>(`blog:post:${slug}`);
  if (!post || Object.keys(post).length === 0 || (post.status && post.status !== "pub")) {
    return { title: "Bulunamadı" };
  }
  const title = post.title || slug;
  const description = post.description || SITE.description;
  const image = post.image || "/resim/sanal-kahve-fali-x2.png";

  return {
    title,
    description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      url: `/blog/${slug}`,
      title,
      description,
      images: [{ url: image }],
    },
    twitter: {
      title,
      description,
      images: [image],
    },
  };
}

async function getPost(slug: string) {
  const post = await redis.hgetall<Record<string, string>>(`blog:post:${slug}`);
  if (!post || Object.keys(post).length === 0) return null;
  if (post.status && post.status !== "pub") return null;
  return post;
}

async function getRelated(currentSlug: string, limit = 3) {
  // Basit benzerler: tarihçe üzerinden ilk N (başlığı alıyoruz)
  const slugs = (await redis.zrange("blog:index", "+inf" as any, "-inf", {
    byScore: true,
    rev: true,
    offset: 0,
    count: 30,
  })) as string[];
  const out: Array<{ slug: string; title: string; image?: string }> = [];
  for (const s of slugs) {
    if (s === currentSlug) continue;
    const it = await redis.hgetall<Record<string, string>>(`blog:post:${s}`);
    if (!it || it.status !== "pub") continue;
    out.push({ slug: s, title: it.title || s, image: it.image || "" });
    if (out.length >= limit) break;
  }
  return out;
}

export default async function Page({ params }: any) {
  const slug = decodeURIComponent(params?.slug || "");
  const post = await getPost(slug);
  if (!post) return notFound();

  const dateStr = post.createdAt ? new Date(Number(post.createdAt)).toLocaleDateString("tr-TR") : "";

  const related = await getRelated(slug, 3);

  return (
    <section className="mx-auto max-w-3xl px-4 py-10 lg:max-w-4xl" style={{ contentVisibility: "auto" }}>
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{post.title}</h1>
        {dateStr && <div className="mt-2 text-sm text-stone-600">{dateStr}</div>}
      </header>

      {post.image ? (
        <div className="mb-6 overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.image} alt={post.title} className="h-auto w-full object-cover" loading="lazy" />
        </div>
      ) : null}

      {/* İçerik: KAYIT SIRASINDA TEMİZLENMİŞ HTML */}
      <article
        className="prose-article"
        dangerouslySetInnerHTML={{ __html: post.content || "" }}
      />

      {/* Benzer Yazılar */}
      {related.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold">Benzer yazılar</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {related.map((r) => (
              <a key={r.slug} href={`/blog/${r.slug}`} className="k-card hover:shadow-lg transition">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {r.image ? <img src={r.image} alt={r.title} className="h-14 w-14 rounded-lg object-cover" /> : null}
                  <div className="font-medium">{r.title}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
