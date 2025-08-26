// app/blog/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import sanitizeHtml from "sanitize-html";
import { redis } from "@/lib/redis";
import { SITE } from "@/lib/seo";

/** Yardımcılar */
async function getPost(slug: string) {
  const row = await redis.hgetall<Record<string, string>>(`blog:post:${slug}`);
  return row;
}

async function getRecent(limit: number, except?: string) {
  // GENERIC KULLANMA — önce unknown[], sonra güvenli daralt
  const raw = (await redis.zrange("blog:index", 0, limit + 2, { rev: true })) as unknown[];
  const slugs = raw.filter((x): x is string => typeof x === "string");
  const filtered = slugs.filter((s) => s && s !== except).slice(0, limit);

  const items = await Promise.all(
    filtered.map(async (s) => {
      const it = await getPost(s);
      if (!it) return null;
      return {
        slug: s,
        title: it.title,
        description: it.description,
        image: it.image,
        createdAt: it.createdAt,
      };
    })
  );
  return items.filter(Boolean) as Array<{
    slug: string;
    title?: string;
    description?: string;
    image?: string;
    createdAt?: string;
  }>;
}

/** Metadata (OG/Twitter/Title/Description) */
export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await getPost(slug);
  if (!post) return { title: "Bulunamadı" };

  const title = post.title || "Blog";
  const desc = post.description || SITE.description;
  const img = post.image || `${SITE.url}/resim/sanal-kahve-fali-x2.png`;

  return {
    title,
    description: desc,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      type: "article",
      url: `${SITE.url}/blog/${slug}`,
      title,
      description: desc,
      images: [{ url: img }],
      siteName: SITE.name,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [img],
    },
  };
}

/** sanitize-html whitelist */
const ALLOWED_TAGS = [
  "p","h1","h2","h3","h4","strong","em","u","s","a","ul","ol","li",
  "blockquote","code","pre","hr","br",
  "img","figure","figcaption",
  "table","thead","tbody","tr","th","td"
];
const ALLOWED_ATTRS: Record<string, string[]> = {
  a: ["href","title","target","rel"],
  img: ["src","alt","title","width","height","loading"],
  "*": ["id","class","style"]
};

export default async function Page(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const post = await getPost(slug);
  if (!post) return notFound();

  // İçeriği güvenli render et
  const clean = sanitizeHtml(post.content || "", {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRS,
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: (tag, attribs) => ({
        tagName: "a",
        attribs: { ...attribs, rel: "nofollow noopener", target: "_blank" },
      }),
      img: (tag, attribs) => ({
        tagName: "img",
        attribs: { ...attribs, loading: "lazy" },
      }),
    },
  });

  const dateStr = post.createdAt ? new Date(post.createdAt).toLocaleDateString("tr-TR") : "";
  const related = await getRecent(6, slug);

  // JSON-LD’ler
  const jsonLdArticle = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description || SITE.description,
    image: post.image ? [post.image] : [`${SITE.url}/resim/sanal-kahve-fali-x2.png`],
    datePublished: post.createdAt || undefined,
    dateModified: post.updatedAt || post.createdAt || undefined,
    author: [{ "@type": "Organization", name: SITE.name }],
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      logo: { "@type": "ImageObject", url: `${SITE.url}/resim/sanal-kahve-fali-x2.png` },
    },
    mainEntityOfPage: `${SITE.url}/blog/${slug}`,
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
    <section className="mx-auto max-w-5xl px-4 py-10">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="text-sm text-stone-600">
        <ol className="flex flex-wrap items-center gap-1">
          <li><Link href="/" className="hover:underline">Ana Sayfa</Link></li>
          <li className="opacity-60">/</li>
          <li><Link href="/blog" className="hover:underline">Blog</Link></li>
          <li className="opacity-60">/</li>
          <li className="truncate max-w-[60vw] sm:max-w-none">
            <span className="font-medium text-stone-800">{post.title}</span>
          </li>
        </ol>
      </nav>

      {/* Hero */}
      <header className="mt-4">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{post.title}</h1>
        {dateStr && <div className="mt-2 text-sm text-stone-600">{dateStr}</div>}
      </header>

      {post.image && (
        <div className="mt-6 overflow-hidden rounded-2xl border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.image}
            alt={post.title || "Blog görseli"}
            className="aspect-[16/9] w-full object-cover"
          />
        </div>
      )}

      {/* İçerik */}
      <article className="prose prose-stone max-w-none prose-headings:scroll-mt-20">
        <div className="k-card mt-6 p-6 sm:p-8" dangerouslySetInnerHTML={{ __html: clean }} />
      </article>

      {/* Paylaş */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="text-sm text-stone-600">Paylaş:</span>
        <a
          className="btn btn-ghost"
          target="_blank"
          rel="noopener"
          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`${SITE.url}/blog/${slug}`)}&text=${encodeURIComponent(post.title || "")}`}
        >
          <i className="fa-brands fa-x-twitter mr-2" /> X
        </a>
        <a
          className="btn btn-ghost"
          target="_blank"
          rel="noopener"
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${SITE.url}/blog/${slug}`)}`}
        >
          <i className="fa-brands fa-facebook mr-2" /> Facebook
        </a>
        <a
          className="btn btn-ghost"
          target="_blank"
          rel="noopener"
          href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${post.title} - ${SITE.url}/blog/${slug}`)}`}
        >
          <i className="fa-brands fa-whatsapp mr-2" /> WhatsApp
        </a>
      </div>

      {/* Benzer yazılar */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold">Benzer yazılar</h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <Link key={r.slug} href={`/blog/${r.slug}`} className="k-card transition hover:shadow">
                {r.image && (
                  <div className="overflow-hidden rounded-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={r.image}
                      alt={r.title || "Öne çıkan görsel"}
                      className="aspect-[16/9] w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="mt-3 font-medium">{r.title}</div>
                {r.description && (
                  <div className="mt-1 line-clamp-2 text-sm text-stone-600">{r.description}</div>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />
    </section>
  );
}
