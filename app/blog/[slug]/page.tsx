import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { redis } from "@/lib/redis";
import { SITE } from "@/lib/seo";

export const revalidate = 600; // 10 dk cache

/** Yardımcılar */
function absImg(src?: string) {
  if (!src) return `${SITE.url}/resim/sanal-kahve-fali-x2.png`;
  if (src.startsWith("http")) return src;
  return `${SITE.url}${src.startsWith("/") ? "" : "/"}${src}`;
}
function toIso(ms?: string) {
  if (!ms) return undefined;
  const n = Number(ms);
  if (!Number.isFinite(n)) return undefined;
  return new Date(n).toISOString();
}
function readingTimeFromHtml(html?: string) {
  if (!html) return 1;
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = text ? text.split(" ").length : 0;
  return Math.max(1, Math.round(words / 200)); // ~200 wpm
}

async function getPost(slug: string) {
  const post = await redis.hgetall<Record<string, string>>(`blog:post:${slug}`);
  if (!post || Object.keys(post).length === 0) return null;
  if (post.status && post.status !== "pub") return null;
  return post;
}

async function getRelated(currentSlug: string, limit = 3) {
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

/** SEO: Metadata */
export async function generateMetadata({ params }: any): Promise<Metadata> {
  const slug = decodeURIComponent(params?.slug || "");
  const post = await getPost(slug);
  if (!post) return { title: "Bulunamadı" };

  const title = post.title || slug;
  const description = post.description || SITE.description;
  const image = absImg(post.image);
  const publishedTime = toIso(post.createdAt);
  const modifiedTime = toIso(post.updatedAt) || publishedTime;

  return {
    title,
    description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      type: "article",
      url: `/blog/${slug}`,
      title,
      description,
      images: [{ url: image }],
      siteName: SITE.name,
      publishedTime,
      modifiedTime,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

/** Sayfa */
export default async function Page({ params }: any) {
  const slug = decodeURIComponent(params?.slug || "");
  const post = await getPost(slug);
  if (!post) return notFound();

  const publishedISO = toIso(post.createdAt);
  const modifiedISO = toIso(post.updatedAt) || publishedISO;
  const dateStr = post.createdAt ? new Date(Number(post.createdAt)).toLocaleDateString("tr-TR") : "";
  const rtime = readingTimeFromHtml(post.content);
  const related = await getRelated(slug, 3);

  /** JSON-LD: BlogPosting + BreadcrumbList */
  const jsonLdArticle = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: `${SITE.url}/blog/${slug}`,
    headline: post.title,
    description: post.description || SITE.description,
    image: [absImg(post.image)],
    author: { "@type": "Organization", name: SITE.name, url: SITE.url },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
      logo: { "@type": "ImageObject", url: `${SITE.url}/resim/sanal-kahve-fali-x2.png` },
    },
    datePublished: publishedISO,
    dateModified: modifiedISO,
    inLanguage: "tr-TR",
  };
  const jsonLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE.url}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: `${SITE.url}/blog/${slug}` },
    ],
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-10" style={{ contentVisibility: "auto" }}>
      {/* Breadcrumb (görsel) */}
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-stone-600">
        <a href="/" className="hover:underline">Ana Sayfa</a>
        <span className="mx-2 opacity-60">/</span>
        <a href="/blog" className="hover:underline">Blog</a>
        <span className="mx-2 opacity-60">/</span>
        <span className="line-clamp-1">{post.title}</span>
      </nav>

      {/* Kart gövdeli makale */}
      <div className="k-card p-6 md:p-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{post.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-stone-600">
            {dateStr && (
              <time dateTime={publishedISO} title={dateStr}>
                {dateStr}
              </time>
            )}
            <span>·</span>
            <span>{rtime} dk okuma</span>
          </div>
        </header>

        {post.image ? (
          <div className="mb-6 overflow-hidden rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.image}
              alt={post.title}
              className="h-auto w-full object-cover"
              loading="lazy"
            />
          </div>
        ) : null}

        {/* İçerik */}
        <article
          className="prose-article"
          dangerouslySetInnerHTML={{ __html: post.content || "" }}
        />
      </div>

      {/* Benzer Yazılar — 3 sütun, kartlı */}
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

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />
    </section>
  );
}
