// app/blog/[slug]/page.tsx
import type { Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import { redis } from "@/lib/redis";
import sanitizeHtml from "sanitize-html";
import { SITE } from "@/lib/seo";

// Yardımcılar
function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
function summarize(html: string, fallback = "", max = 160) {
  const t = stripHtml(html || "") || (fallback || "");
  return t.slice(0, max);
}
function safeDate(v?: string) {
  const n = Number(v || 0);
  if (!n) return undefined;
  return new Date(n).toISOString();
}

// Metadata (sayfa başlığı, description, OG/Twitter)
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const post = await redis.hgetall<Record<string, string>>(`blog:post:${slug}`);
  if (!post || post.status !== "pub") return { title: "Bulunamadı" };

  const seoTitle = (post.seoTitle || post.title || "Blog") + " | " + SITE.name;
  const desc =
    post.seoDescription ||
    post.description ||
    summarize(post.content || "", SITE.description, 160);
  const ogImg = post.ogImage || post.image || `${SITE.url}/resim/sanal-kahve-fali-x2.png`;
  const url = `${SITE.url}/blog/${encodeURIComponent(slug)}`;
  const published = safeDate(post.createdAt);
  const modified = safeDate(post.updatedAt || post.createdAt);

  return {
    title: { absolute: seoTitle },
    description: desc,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      type: "article",
      url,
      siteName: SITE.name,
      title: seoTitle,
      description: desc,
      images: [{ url: ogImg }],
      publishedTime: published,
      modifiedTime: modified,
    },
    twitter: {
      card: "summary_large_image",
      site: SITE.twitter || undefined,
      title: seoTitle,
      description: desc,
      images: [ogImg],
    },
  };
}

export default async function Page(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const post = await redis.hgetall<Record<string, string>>(`blog:post:${slug}`);
  if (!post || post.status !== "pub") notFound();

  const dateStr = post.createdAt
    ? new Date(Number(post.createdAt)).toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  // İçeriği güvenli render et — defaults yerine manuel allowlist
  const clean = sanitizeHtml(post.content || "", {
    allowedTags: [
      "p","h1","h2","h3","h4","h5","h6",
      "strong","em","u","s",
      "a","ul","ol","li",
      "blockquote","code","pre","hr","br",
      "img","figure","figcaption",
      "table","thead","tbody","tr","th","td",
      "span","div"
    ],
    allowedAttributes: {
      a: ["href", "title", "rel", "target"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      "*": ["class", "id", "style"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: (tagName, attribs) => ({
        tagName: "a",
        attribs: { ...attribs, rel: "nofollow noopener", target: "_blank" },
      }),
      img: (tagName, attribs) => {
        const src = attribs.src || "";
        return {
          tagName: "img",
          attribs: {
            ...attribs,
            src,
            loading: "lazy",
          },
        };
      },
    },
  });

  // JSON-LD: Article
  const desc =
    post.seoDescription ||
    post.description ||
    summarize(post.content || "", SITE.description, 160);
  const ogImg = post.ogImage || post.image || `${SITE.url}/resim/sanal-kahve-fali-x2.png`;

  const jsonLdArticle = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.seoTitle || post.title,
    description: desc,
    image: ogImg,
    datePublished: safeDate(post.createdAt),
    dateModified: safeDate(post.updatedAt || post.createdAt),
    author: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
    },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      logo: {
        "@type": "ImageObject",
        url: `${SITE.url}/resim/sanal-kahve-fali-x2.png`,
      },
    },
    mainEntityOfPage: `${SITE.url}/blog/${encodeURIComponent(slug)}`,
  };

  return (
    <section className="mx-auto max-w-3xl px-4 py-10 lg:max-w-4xl">
      {/* Başlık / tarih */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{post.title}</h1>
        <div className="mt-2 text-sm text-stone-600">{dateStr}</div>
      </header>

      {/* Öne çıkarılan görsel */}
      {post.image && (
        <div className="mb-6 overflow-hidden rounded-2xl ring-1 ring-stone-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.image}
            alt={post.title}
            className="h-auto w-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* İçerik kutusu */}
      <article
        className="prose-article k-card p-6"
        dangerouslySetInnerHTML={{ __html: clean }}
      />

      {/* JSON-LD */}
      <Script
        id="ld-article"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />
    </section>
  );
}
