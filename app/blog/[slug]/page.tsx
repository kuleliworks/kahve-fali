// app/blog/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { redis } from "@/lib/redis";
import sanitizeHtml, { IOptions } from "sanitize-html";
import { SITE } from "@/lib/seo";

export const dynamic = "force-dynamic"; // KV'den dinamik okuma

type Post = {
  title: string;
  slug: string;
  description?: string;
  image?: string;
  content?: string;      // HTML olarak tutulur
  createdAt?: string;    // timestamp (ms)
  updatedAt?: string;    // timestamp (ms)
  status?: string;       // "pub" | "draft"
};

// HTML'den kısa özet üret
function excerptFromHtml(html: string, max = 160) {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? text.slice(0, max - 1) + "…" : text;
}

// Güvenli HTML seçenekleri
const CLEAN_OPTS: IOptions = {
  allowedTags: [
    "p","h1","h2","h3","h4","strong","em","u","s","a","ul","ol","li",
    "blockquote","code","pre","hr","br","img","figure","figcaption",
    "table","thead","tbody","tr","th","td"
  ],
  allowedAttributes: {
    a: ["href","title","target","rel"],
    img: ["src","alt","width","height","loading","decoding"],
    "*": []
  },
  allowedSchemes: ["http","https","data","mailto","tel"],
  transformTags: {
    a: (tagName, attribs) => {
      const href = attribs.href || "#";
      const isExternal =
        /^https?:\/\//i.test(href) && !href.startsWith(SITE.url);
      return {
        tagName: "a",
        attribs: {
          ...attribs,
          ...(isExternal
            ? { target: "_blank", rel: "noopener nofollow noreferrer" }
            : {})
        }
      };
    }
  }
};

async function getPost(slug: string): Promise<Post | null> {
  const it = await redis.hgetall<Record<string, string>>(`blog:post:${slug}`);
  if (!it || it.status !== "pub") return null;
  return {
    title: it.title,
    slug: it.slug,
    description: it.description,
    image: it.image,
    content: it.content,
    createdAt: it.createdAt,
    updatedAt: it.updatedAt,
    status: it.status
  };
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Yazı bulunamadı" };

  const safeHtml = sanitizeHtml(post.content || "", CLEAN_OPTS);
  const desc = post.description || excerptFromHtml(safeHtml, 160);
  const img = post.image || "/resim/sanal-kahve-fali-x2.png";
  const url = `/blog/${post.slug}`;

  return {
    title: post.title,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      url,
      title: post.title,
      description: desc,
      images: [{ url: img }],
      type: "article"
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: desc,
      images: [img]
    }
  };
}

export default async function Page(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return notFound();

  const safeHtml = sanitizeHtml(post.content || "", CLEAN_OPTS);
  const published = post.createdAt ? new Date(Number(post.createdAt)) : null;
  const updated = post.updatedAt ? new Date(Number(post.updatedAt)) : null;

  // JSON-LD (Article)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    mainEntityOfPage: `${SITE.url}/blog/${post.slug}`,
    headline: post.title,
    image: post.image ? [post.image] : [`${SITE.url}/resim/sanal-kahve-fali-x2.png`],
    datePublished: published ? published.toISOString() : undefined,
    dateModified: updated ? updated.toISOString() : undefined,
    author: { "@type": "Organization", name: SITE.name, url: SITE.url },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      logo: {
        "@type": "ImageObject",
        url: `${SITE.url}/resim/sanal-kahve-fali-x2.png`
      }
    },
    description: post.description || excerptFromHtml(safeHtml, 160)
  };

  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      {/* Başlık & meta */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {post.title}
        </h1>
        <div className="mt-2 text-sm text-stone-500">
          {published && <>Yayın: {published.toLocaleDateString("tr-TR")}</>}
          {updated && <> · Güncelleme: {updated.toLocaleDateString("tr-TR")}</>}
        </div>
      </header>

      {/* Öne çıkarılan görsel */}
      {post.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.image}
          alt={post.title}
          className="mb-6 w-full rounded-2xl object-cover shadow-sm"
          loading="lazy"
        />
      )}

      {/* İçerik (HTML) */}
      <article
        className="prose prose-stone max-w-none prose-img:rounded-xl prose-headings:scroll-mt-24"
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  );
}
