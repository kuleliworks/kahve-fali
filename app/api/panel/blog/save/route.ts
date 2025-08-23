import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import sanitizeHtml from "sanitize-html";

export const runtime = "nodejs";
export const maxDuration = 60;

const CLEAN_OPTS = {
  allowedTags: [
    "p","h1","h2","h3","h4","strong","em","u","s","a","ul","ol","li",
    "blockquote","code","pre","hr","br","img","figure","figcaption","table","thead","tbody","tr","th","td"
  ],
  allowedAttributes: {
    a: ["href","title","target","rel"],
    img: ["src","alt","title","width","height","loading","decoding"],
    "*": ["class"]
  },
  allowedSchemes: ["http","https","mailto"],
};

function slugify(s: string) {
  return (s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 80);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const title: string = (body.title || "").toString().trim();
    const rawSlug: string = (body.slug || "").toString().trim();
    const descriptionIn: string = (body.description || "").toString().trim();
    const image: string = (body.image || "").toString().trim();
    const contentRaw: string = (body.content || "").toString();
    const status: string = (body.status || "pub").toString();

    if (!title) return NextResponse.json({ error: "title gerekli" }, { status: 400 });
    const slug = rawSlug || slugify(title);
    if (!slug) return NextResponse.json({ error: "slug üretilemedi" }, { status: 400 });

    // İçeriği temizle
    const cleanHtml = sanitizeHtml(contentRaw, CLEAN_OPTS);

    // Açıklama yoksa ilk 160 karakter düz metin
    const plain = cleanHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const description = descriptionIn || plain.slice(0, 160);

    const key = `blog:post:${slug}`;
    const now = Date.now();

    // Daha önce var mı?
    const exists = await redis.exists(key);

    // Kaydet
    await redis.hset(key, {
      title,
      slug,
      description,
      image,
      content: cleanHtml,     // << Tekil sayfada doğrudan basacağız
      status,                 // "pub" veya "draft"
      updatedAt: String(now),
      ...(exists ? {} : { createdAt: String(now) }),
    });

    // ZSet index (createdAt ile sıralansın)
    if (!exists) {
      await redis.zadd("blog:index", { score: now, member: slug });
    }

    return NextResponse.json({ ok: true, slug }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "save failed" }, { status: 500 });
  }
}
