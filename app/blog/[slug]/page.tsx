// app/blog/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { redis } from "@/lib/redis";

type Post = {
  title: string; slug: string; description?: string; image?: string; content?: string; updatedAt?: string; status?: string;
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
    updatedAt: it.updatedAt,
    status: it.status,
  };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Yazı bulunamadı" };
  return {
    title: post.title,
    description: post.description || "Sanal kahve falı blog yazısı.",
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      url: `/blog/${post.slug}`,
      title: post.title,
      description: post.description || "",
      images: post.image ? [{ url: post.image }] : [{ url: "/resim/sanal-kahve-fali-x2.png" }],
      type: "article",
    },
    twitter: {
      title: post.title,
      description: post.description || "",
      images: [post.image || "/resim/sanal-kahve-fali-x2.png"],
      card: "summary_large_image",
    },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return notFound();

  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <article className="prose prose-stone max-w-none">
        <h1>{post.title}</h1>
        {post.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.image} alt={post.title} className="my-4 rounded-2xl" loading="lazy" />
        )}
        {post.description && <p className="lead">{post.description}</p>}
        {/* İçerik sade: textarea’dan gelen düz yazı/markdown olabilir */}
        {post.content?.split("\n").map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </article>
    </section>
  );
}
