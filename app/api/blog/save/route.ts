// app/api/blog/save/route.ts
import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

type SaveBody = {
  title?: string;
  slug?: string;
  description?: string;
  image?: string;
  content?: string;
  status?: "pub" | "draft";
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
};

function slugify(input: string) {
  return (input || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

// Sadece POST
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as SaveBody | null;
    if (!body) {
      return NextResponse.json({ ok: false, error: "Geçersiz gövde" }, { status: 400 });
    }

    const title = (body.title || "").trim();
    let slug = (body.slug || "").trim();

    if (!title) return NextResponse.json({ ok: false, error: "Başlık zorunlu" }, { status: 400 });
    if (!slug) slug = slugify(title);

    const key = `blog:post:${slug}`;
    const now = Date.now();

    // Eski kayıt varsa createdAt'i koru
    const old = await redis.hgetall<Record<string, string>>(key);
    const createdAt = old?.createdAt ? Number(old.createdAt) : now;

    const data = {
      title,
      slug,
      description: body.description || "",
      image: body.image || "",
      content: body.content || "",
      status: body.status === "draft" ? "draft" : "pub",
      createdAt: String(createdAt),
      updatedAt: String(now),
      seoTitle: body.seoTitle || "",
      seoDescription: body.seoDescription || "",
      ogImage: body.ogImage || body.image || "",
    };

    // Kaydet
    await redis.hset(key, data);
    // Index (en yeni önce görünmesi için score = createdAt)
    await redis.zadd("blog:index", { score: createdAt, member: slug });

    return NextResponse.json({ ok: true, slug });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Sunucu hatası" }, { status: 500 });
  }
}

// GET'e izin yok -> 405 (test için /api/blog/save açarsan JSON döner)
export async function GET() {
  return NextResponse.json({ ok: false, error: "Method not allowed" }, { status: 405 });
}
