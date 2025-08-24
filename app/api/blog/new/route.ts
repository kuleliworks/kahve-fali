import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { title, slug, description, image, imageKey, content, status } = await req.json();

    if (!title || !slug) {
      return NextResponse.json({ ok: false, error: "title/slug zorunlu" }, { status: 400 });
    }

    // Mükerrer slug kontrolü
    const exists = await redis.exists(`blog:post:${slug}`);
    if (exists) {
      return NextResponse.json({ ok: false, error: "Bu slug zaten kullanılıyor." }, { status: 409 });
    }

    const createdAt = new Date().toISOString();

    await redis.hset(`blog:post:${slug}`, {
      title,
      description: description || "",
      image: image || "",
      imageKey: imageKey || "",
      content: content || "",
      status: status === "pub" ? "pub" : "draft",
      createdAt,
    });

    // Sıralı liste
    await redis.zadd("blog:index", { score: Date.now(), member: slug });

    return NextResponse.json({ ok: true, slug });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Kayıt hatası" }, { status: 500 });
  }
}
