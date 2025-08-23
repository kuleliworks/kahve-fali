import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { redis } from "@/lib/redis";
import { SITE } from "@/lib/seo";
import sanitizeHtml from "sanitize-html";
import BlogCard, { type BlogCardPost } from "@/components/BlogCard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PostKV = {
  title?: string;
  slug?: string;
  description?: string;
  image?: string;
  content?: string;     // HTML
  status?: "pub" | "draft";
  createdAt?: string;   // ms
  updatedAt?: string;   // ms
};

/** sanitize-html ayarları (simpleTransform KULLANMADAN) */
const CLEAN_OPTS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p","h1","h2","h3","h4","strong","em","u","s","a","ul","ol","li",
    "blockquote","code","pre","hr","br","img","figure","figcaption",
    "table","thead","tbody","tr","th","td"
  ],
  allowedAttributes: {
    a: ["href","title","rel","target"],
    img: ["src","alt","title","width","height","loading"],
    "*": ["class"]
  },
  allowedSchemes: ["http","https","mailto"],
  transformTags: {
    a: (_tag, attribs) => {
      // href dışındaki öznitelikleri güvenli değerlere sabitle
      const href = attribs.href || "#";
      return {
        tagName: "a",
        attribs: {
          href,
          title: attribs.title || "",
          rel: "nofollow noopener",
          target: "_blank",
          class: (attribs.class || "")
        }
      };
    },
    img: (_tag, attribs) => {
      const src = attribs.src || "";
      return {
        tagName: "img",
        attribs: {
          src,
          alt: attribs.alt || "",
          loading: "lazy",
          class: (attribs.class || "") + " rounded-xl"
        }
      };
    }
  }
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
function summarize(html: string, fallback = ""): string {
  const text = stripHtml(html);
  return text ? (text.length > 160 ? text.slice(0, 157) + "…" : text) : fallback;
}

async function getPost(slug: string): Promise<Required<PostKV> | null> {
  const it = await redis.hgetall<Record<string, string>>(`blog:post:${slug}`);
  if (!it || Object.keys(it).length === 0) return null;
  if (it.status && it.status !== "pub") return null;
  return {
    title: it.title || slug,
    slug,
    description: it.description || "",
    image: it.image || "",
    content: it.content || "",
    status: (it.status as any) || "pub",
    createdAt: it.createdAt || Date.now().toString(),
    updatedAt: it.updatedAt || it.createdAt || Date.now().toString()
  };
}

async function getRelated(slug: string, take = 3): Promise<BlogCardPost[]> {
  const slugs = (await redis.zrange("blog:index", "+inf" as any, "-inf", {
    byScore: true,
    rev: true,
    offset: 0,
    count: 30, // doğru kullanım
  })) as string[];

  const out: BlogCardPost[] = [];
  for (const s of slugs) {
    if (s === slug) continue;
    const it = await redis.hgetall<Record<string, string>>(`blog:post:${s}`);
    if (!it || Object.keys(it).length === 0) continue;
    if (it.status && it.status !== "pub") continue;
    out.push({
      slug: s,
      title: it.title || s,
      description: it.description || "",
      image: it.image || "",
      createdAt: it.createdAt || ""
    });
    if (out.length >= take) break;
  }
  return out;
}

/** Next 15.5: params Promise olabilir → await */
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(decodeURIComponent(slug));
  if (!post) return { title: "Yazı bulunamadı" };

  const title = post.title;
  const desc = post.description || summarize(post.content, SITE.description);
  const url = `${SITE.url}/blog/${post.slug}`;
  const image = post.image || "/resim/sanal-kahve-fali-x2.png";

  return {
    title,
    description: desc,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      url,
      siteName: SITE.name,
      title,
      description: desc,
      images: [{ url: image }]
    },
    twitter: {
      card: "summary_large_image",
      site: SITE.twitter || undefined,
      title,
      description: desc,
      images: [image]
    }
  };
}

export default async function Page(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const post = await getPost(decoded);
  if (!post) return notFound();

  const created = Number(post.createdAt);
  const updated = Number(post.updatedAt);
  const dateStr = isNaN(created) ? "" : new Date(created).toLocaleDateString("tr-TR");
  const clean = sanitizeHtml(post.content, CLEAN_OPTS);
  const shareUrl = `${SITE.url}/blog/${post.slug}`;
  const shareTitle = encodeURIComponent(post.title);

  const jsonLdArticle = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description || summarize(post.content),
    image: post.image ? [post.image] : [`${SITE.url}/resim/sanal-kahve-fali-x2.png`],
    mainEntityOfPage: `${SITE.url}/blog/${post.slug}`,
    author: { "@type": "Organization", name: SITE.name, url: SITE.url },
    publisher: { "@type": "Organization", name: SITE.name, logo: { "@type": "ImageObject", url: `${SITE.url}/resim/sanal-kahve-fali-x2.png` } },
    datePublished: isNaN(created) ? undefined : new Date(created).toISOString(),
    dateModified: isNaN(updated) ? undefined : new Date(updated).toISOString()
  };

  const related = await getRelated(decoded, 3);

  return (
    <section className="mx-auto max-w-3xl px-4 py-10 lg:max-w-4xl">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{post.title}</h1>
        <div className="mt-2 text-sm text-stone-600">{dateStr}</div>
      </header>

      {post.image && (
        <div className="mb-6 overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.image}
            alt={post.title}
            className="h-auto w-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      <article className="k-card prose-article p-6">
        <div dangerouslySetInnerHTML={{ __html: clean }} />
      </article>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <a
          className="btn btn-ghost"
          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${shareTitle}`}
          target="_blank" rel="noopener nofollow"
        >
          <i className="fa-brands fa-x-twitter mr-2" /> X’te paylaş
        </a>
        <a
          className="btn btn-ghost"
          href={`https://api.whatsapp.com/send?text=${encodeURIComponent(post.title + " " + shareUrl)}`}
          target="_blank" rel="noopener nofollow"
        >
          <i className="fa-brands fa-whatsapp mr-2" /> WhatsApp
        </a>
        <a
          className="btn btn-ghost"
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
          target="_blank" rel="noopener nofollow"
        >
          <i className="fa-brands fa-facebook mr-2" /> Facebook
        </a>
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-semibold tracking-tight">Benzer yazılar</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => <BlogCard key={p.slug} post={p} />)}
          </div>
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />
    </section>
  );
}
