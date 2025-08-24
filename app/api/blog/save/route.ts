import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

type Body = {
  title: string;
  slug?: string;
  description?: string;
  image?: string;        // <- ÖNEMLİ: image bu isimle gelsin/kaydedilsin
  content?: string;
  status?: "draft" | "pub";
};

function toSlug(input: string) {
  const map: Record<string, string> = {
    ç:"c", Ç:"c", ğ:"g", Ğ:"g", ı:"i", İ:"i", ö:"o", Ö:"o", ş:"s", Ş:"s", ü:"u", Ü:"u",
  };
  return (input || "")
    .replace(/[çÇğĞıİöÖşŞüÜ]/g, (m) => map[m] || m)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\- ]+/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/\-+/g, "-");
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    if (!body?.title) {
      return NextResponse.json({ error: "title zorunlu" }, { status: 400 });
    }

    const slug = body.slug ? toSlug(body.slug) : toSlug(body.title);
    if (!slug) {
      return NextResponse.json({ error: "Geçersiz slug" }, { status: 400 });
    }

    const key = `blog:post:${slug}`;
    const exists = await redis.exists(key);

    // createdAt (ilk defa ise şimdi)
    let createdAt = (await redis.hget<string>(key, "createdAt")) || "";
    if (!exists || !createdAt) createdAt = String(Date.now());

    // Kaydet
    await redis.hset(key, {
      title: body.title,
      slug,
      description: body.description || "",
      image: body.image || "",       // <- ÖNEMLİ
      content: body.content || "",
      status: body.status || "draft",
      createdAt,
      updatedAt: String(Date.now()),
    });

    // Indeks
    await redis.zadd("blog:index", { score: Number(createdAt), member: slug });

    return NextResponse.json({ ok: true, slug });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "save hata" }, { status: 500 });
  }
}
