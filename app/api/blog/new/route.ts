import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Boş gövde" }, { status: 400 });

    const { title, slug, description = "", image = "", content = "", status = "draft" } = body;

    if (!title || !slug) {
      return NextResponse.json({ error: "title ve slug zorunlu" }, { status: 400 });
    }

    const key = `blog:post:${slug}`;
    const exists = await redis.exists(key);
    if (exists) {
      return NextResponse.json({ error: "Bu slug zaten mevcut" }, { status: 409 });
    }

    const now = Date.now().toString();

    await redis.hset(key, {
      title,
      description,
      image,        // <-- ÖNEMLİ: image alanını yaz
      content,
      status,
      createdAt: now,
    });

    // indeks (yeni -> eski)
    await redis.zadd("blog:index", { score: Date.now(), member: slug });

    return NextResponse.json({ ok: true, slug });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Beklenmedik hata" }, { status: 500 });
  }
}
