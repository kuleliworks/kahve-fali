import { notFound } from "next/navigation";
import sanitizeHtml from "sanitize-html";
import { redis } from "@/lib/redis";
import { SITE } from "@/lib/seo";

type Post = {
  title: string;
  slug: string;
  description?: string;
  image?: string;
  content: string;
  status?: "draft" | "pub";
  createdAt?: string;
  updatedAt?: string;
};

export async function generateStaticParams() {
  // Statik build’lerde sorun yaşamamak için boş bırakıyoruz (SSG yerine dinamik).
  return [];
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getPost(slug: string): Promise<Post | null> {
  const it = await redis.hgetall<Record<string, string>>(`blog:post:${slug}`);
  if (!it || it.status !== "pub") return null;
  return {
    title: it.title,
    slug,
    description: it.description || "",
    image: it.image || "",
    content: it.content || "",
    status: it.status as any,
    createdAt: it.createdAt,
    updatedAt: it.updatedAt,
  };
}

export default async function Page({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) return notFound();

  const clean = sanitizeHtml(post.content || "", {
    allowedTags: [
      "p","h1","h2","h3","h4","strong","em","u","s","a","ul","ol","li",
      "blockquote","code","pre","hr","br","img","figure","figcaption","table","thead","tbody","tr","th","td"
    ],
    allowedAttributes: {
      a: ["href","title","target","rel"],
      img: ["src","alt","title","width","height","loading","decoding"]
    },
    allowedSchemes: ["http","https","mailto"],
  });

  const dateStr = post.updatedAt
    ? new Date(Number(post.updatedAt)).toLocaleDateString("tr-TR")
    : "";

  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{post.title}</h1>
        {dateStr && <div className="mt-2 text-sm text-stone-600">{dateStr}</div>}
      </header>

      {/* ÖNE ÇIKARILAN GÖRSEL — kırpmadan sığdır */}
      {post.image ? (
        <div className="overflow-hidden rounded-2xl bg-stone-50 ring-1 ring-stone-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.image}
            alt={post.title}
            className="w-full max-h-[70vh] object-contain"
            loading="lazy"
            decoding="async"
          />
        </div>
      ) : null}

      {/* İÇERİK */}
      <article
        className="prose prose-stone mt-8 max-w-none prose-h2:mt-8 prose-img:rounded-xl"
        dangerouslySetInnerHTML={{ __html: clean }}
      />

      {/* BENZER YAZILAR (3 sütun) */}
      <RelatedPosts currentSlug={post.slug} />
    </section>
  );
}

async function getRelated(currentSlug: string, take = 3) {
  // Basit: En yeni ilk 50’yi çek, current’ı çıkar, ilk 3’ü al
  const slugs = (await redis.zrange("blog:index", 0, 49, { rev: true })) as string[];
  const out: Array<{ slug: string; title: string; image?: string }> = [];
  for (const s of slugs) {
    if (s === currentSlug) continue;
    const it = await redis.hgetall<Record<string, string>>(`blog:post:${s}`);
    if (it && it.status === "pub") {
      out.push({ slug: s, title: it.title, image: it.image || "" });
      if (out.length >= take) break;
    }
  }
  return out;
}

async function RelatedPosts({ currentSlug }: { currentSlug: string }) {
  const related = await getRelated(currentSlug, 3);
  if (!related.length) return null;
  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold">Benzer yazılar</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((p) => (
          <a key={p.slug} href={`/blog/${p.slug}`} className="k-card block hover:shadow-md transition">
            <div className="aspect-[16/9] overflow-hidden rounded-xl bg-stone-100 ring-1 ring-stone-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.image || "/resim/sanal-kahve-fali-x2.png"}
                alt={p.title}
                className="h-full w-full object-contain"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="mt-3 font-medium">{p.title}</div>
          </a>
        ))}
      </div>
    </section>
  );
}
