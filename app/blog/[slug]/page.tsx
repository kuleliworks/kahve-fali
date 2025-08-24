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
  image?: string;
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
    image: it.image || "",
    content: it.content || "",
    status: it.status || "draft",
    createdAt: it.createdAt || "",
  };
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) {
    return {
      title: "Bulunamadı | Sanal Kahve Falı",
      description: SITE.description,
    };
  }

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
      siteName: SITE.name,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description || SITE.description,
      images: [ogImg],
    },
  };
}

/** sanitize-html izin listeleri (defaults KULLANMADAN) */
const ALLOWED_TAGS = [
  "p","h1","h2","h3","h4","strong","em","u","s","a","ul","ol","li",
  "blockquote","code","pre","hr","br","img","figure","figcaption",
  "table","thead","tbody","tr","th","td"
];

const ALLOWED_ATTR: Record<string, string[]> = {
  a: ["href","name","target","rel"],
  img: ["src","alt","title","width","height","loading"],
  "*": ["class","id","style"]
};

export default async function Page(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const created = post.createdAt ? new Date(Number(post.createdAt)) : null;
  const dateStr = created ? created.toLocaleDateString("tr-TR") : "";

  const clean = sanitizeHtml(post.content || "", {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTR,
    allowedSchemes: ["http","https","mailto"],
    transformTags: {
      a: (_tag, attribs) => ({
        tagName: "a",
        attribs: { ...attribs, rel: "nofollow noopener", target: "_blank" },
      }),
      img: (_tag, attribs) => ({
        tagName: "img",
        attribs: { ...attribs, loading: "lazy" },
      }),
    },
  });

  const hero = post.image || "/resim/sanal-kahve-fali-x2.png";

  return (
    <section className="mx-auto max-w-3xl px-4 py-10 lg:max-w-4xl">
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
