import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

type Payload = {
  title: string;
  slug?: string;
  description?: string;
  image?: string;
  content?: string;         // HTML olarak kaydediyoruz
  status?: "pub" | "draft";
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/[^a-z0-9\-_\s]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as Payload | null;
    if (!body || !body.title) {
      return NextResponse.json({ error: "Başlık gerekli." }, { status: 400 });
    }

    const now = Date.now().toString();
    const slug = (body.slug && body.slug.trim()) ? slugify(body.slug) : slugify(body.title);

    const data = {
      title: body.title,
      slug,
      description: body.description || "",
      image: body.image || "",
      content: body.content || "",
      status: body.status === "draft" ? "draft" : "pub",
      createdAt: now,
      updatedAt: now,
    };

    // KV yaz
    await redis.hset(`blog:post:${slug}`, data);
    await redis.zadd("blog:index", { score: Number(now), member: slug });

    // Mutlaka JSON dön
    return NextResponse.json({ ok: true, slug }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "create failed" }, { status: 500 });
  }
}

// Yanlış method’a da JSON dön (opsiyonel)
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
