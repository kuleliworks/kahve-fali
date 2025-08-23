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
  // basit benzerler: en yeni 30 içinden "current" hariç ilk N
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

      {/* içerik: kayıt sırasında sanitize edilmiş HTML */}
      <article
        className="prose-article"
        dangerouslySetInnerHTML={{ __html: post.content || "" }}
      />

      {/* Benzer Yazılar — 3 sütun */}
      {related.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold">Benzer yazılar</h2>
          <div className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <a key={r.slug} href={`/blog/${r.slug}`} className="k-card h-full hover:shadow-lg transition">
                {r.image ? (
                  <div className="mb-3 overflow-hidden rounded-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={r.image}
                      alt={r.title}
                      className="h-36 w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ) : null}
                <div className="font-medium">{r.title}</div>
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
