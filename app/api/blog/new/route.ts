// app/api/blog/new/route.ts
import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export const runtime = "edge";

// TR uyumlu slugify
function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/--+/g, "-");
}

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => null);
    if (!json) {
      return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
    }

    const title = (json.title || "").trim();
    const desired = (json.slug || "").trim();
    const description = (json.description || "").trim();
    const content = (json.content || "").trim();
    const image = (json.image || "").trim();
    const status = (json.status || "pub").trim(); // "pub" | "draft"

    if (!title || !content) {
      return NextResponse.json(
        { error: "Başlık ve içerik zorunlu." },
        { status: 400 }
      );
    }

    let slug = slugify(desired || title);
    if (!slug) slug = `yazi-${Date.now()}`;

    // Slug çakışması: -2, -3 ekle
    let finalSlug = slug;
    for (let i = 2; i < 50; i++) {
      const exists = await redis.hgetall(`blog:post:${finalSlug}`);
      if (!exists || Object.keys(exists).length === 0) break;
      finalSlug = `${slug}-${i}`;
    }

    const nowISO = new Date().toISOString();
    const nowTS = Date.now();

    // Kaydet
    await redis.hset(`blog:post:${finalSlug}`, {
      title,
      description,
      content,
      image,
      status,
      createdAt: nowISO,
      updatedAt: nowISO,
    });

    // Sıralı liste (yeni->eski için score=timestamp)
    await redis.zadd("blog:index", { score: nowTS, member: finalSlug });

    return NextResponse.json({ ok: true, slug: finalSlug });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Kayıt hatası" },
      { status: 500 }
    );
  }
}
