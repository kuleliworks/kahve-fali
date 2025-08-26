// app/api/blog/save/route.ts
import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export const runtime = "edge";

type Body = {
  title: string;
  slug?: string;
  description?: string;
  image?: string;
  content?: string;
  status?: "pub" | "draft";
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function POST(req: Request) {
  try {
    const b = (await req.json()) as Body;
    if (!b?.title) {
      return NextResponse.json({ ok: false, error: "Başlık zorunlu" }, { status: 400 });
    }

    const now = Date.now();
    const base = b.slug ? slugify(b.slug) : slugify(b.title);
    let finalSlug = base || `yazi-${now}`;

    // Slug çakışmasını çöz
    for (let i = 2; i < 1000; i++) {
      const exists = await redis.exists(`blog:post:${finalSlug}`);
      if (!exists) break;
      finalSlug = `${base}-${i}`;
    }

    const key = `blog:post:${finalSlug}`;

    await redis.hset(key, {
      title: b.title,
      description: b.description ?? "",
      image: b.image ?? "",
      content: b.content ?? "",
      status: b.status ?? "pub",
      createdAt: String(now),
      updatedAt: String(now),
      slug: finalSlug,
    });

    // Indexe (timestamp ile) ekle
    await redis.zadd("blog:index", { score: now, member: finalSlug });

    return NextResponse.json({ ok: true, slug: finalSlug });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "save failed" },
      { status: 500 }
    );
  }
}
