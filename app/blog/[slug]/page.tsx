import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { redis } from "@/lib/redis";
import { SITE } from "@/lib/seo";
import sanitizeHtml from "sanitize-html";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Post = {
  title: string;
  slug: string;
  description?: string;
  image?: string;     // <- ÖNEMLİ
  content?: string;
  status?: string;
  createdAt?: string;
};

async function getPost(slug: string): Promise<Post | null> {
  const it = await redis.hgetall<Record<string, string>>(`blog:post:${slug}`);
  if (!it) return null;
  return {
    title: it.title || slug,
    slug,
    description: it.description || "",
    image: it.image || "",     // <- ÖNEMLİ
    content: it.content || "",
    status: it.status || "draft",
    createdAt: it.createdAt || "",
  };
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return { title: "Bulunamadı" };

  const ogImg = post.image || `${SITE.url}/resim/sanal-kahve-fali-x2.png`;

  return {
    title: post.title,
    description: post.description || SITE.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      url: `${SITE.url}/blog/${post.slug}`,
      title: post.title,
      description: post.description || SITE.description,
      images: [{ url: ogImg }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description || SITE.description,
      images: [ogImg],
    },
  };
}

export default async function Page({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const created = post.createdAt ? new Date(Number(post.createdAt)) : null;
  const dateStr = created ? created.toLocaleDateString("tr-TR") : "";

  const clean = sanitizeHtml(post.content || "", {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "img","figure","figcaption","h1","h2","h3","table","thead","tbody","tr","th","td"
    ]),
    allowedAttributes: {
      a: ["href","name","target","rel"],
      img: ["src","alt","title","width","height","loading"],
      "*": ["class","id","style"]
    },
    allowedSchemes: ["http","https","mailto"],
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

  const hero = post.image || "/resim/sanal-kahve-fali-x2.png"; // <- ÖNEMLİ

  return (
    <section className="mx-auto max-w-3xl px-4 py-10 lg:max-w-4xl">
      {/* Hero görsel */}
      <div className="overflow-hidden rounded-2xl ring-1 ring-stone-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={hero} alt={post.title} className="h-64 w-full object-cover sm:h-80" />
      </div>

      <header className="mb-6 mt-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{post.title}</h1>
        <div className="mt-2 text-sm text-stone-600">{dateStr}</div>
      </header>

      <article
        className="prose prose-stone max-w-none prose-headings:scroll-mt-24"
        dangerouslySetInnerHTML={{ __html: clean }}
      />
    </section>
  );
}
