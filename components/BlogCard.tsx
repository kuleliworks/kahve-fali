export type BlogCardPost = {
  slug: string;
  title: string;
  description?: string;
  image?: string;
  createdAt?: string;
};

export default function BlogCard({ post }: { post: BlogCardPost }) {
  return (
    <article className="k-card overflow-hidden hover:shadow-lg transition">
      <a href={`/blog/${post.slug}`} className="block">
        {post.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.image}
            alt={post.title}
            className="h-44 w-full object-cover"
            loading="lazy"
          />
        ) : null}
        <div className="p-4">
          <h3 className="text-lg font-semibold">{post.title}</h3>
          {post.description ? (
            <p className="mt-1 text-stone-600 line-clamp-2">{post.description}</p>
          ) : null}
          <div className="mt-3 text-xs text-stone-500">
            {post.createdAt ? new Date(Number(post.createdAt)).toLocaleDateString("tr-TR") : ""}
          </div>
        </div>
      </a>
    </article>
  );
}
