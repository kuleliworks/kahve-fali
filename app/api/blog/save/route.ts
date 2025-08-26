// app/api/blog/save/route.ts
import { NextResponse } from "next/server";
import { redis } from "@/lib/redis"; // Upstash client

type Body = {
  title?: string;
  slug?: string;
  description?: string;     // kısa özet (opsiyonel)
  image?: string;           // öne çıkan görsel (opsiyonel)
  content?: string;         // HTML/Markdown
  status?: "draft" | "pub";

  // --- SEO alanları (opsiyonel) ---
  seoTitle?: string;        // <title> override
  seoDescription?: string;  // <meta description>
  ogImage?: string;         // OG/Twitter için özel görsel
};

function normalizeSlug(s: string) {
  // TR karakterleri sadeleştir + kebab-case
  const map: Record<string,string> = {
    ç:"c", ğ:"g", ı:"i", i:"i", ö:"o", ş:"s", ü:"u",
    Ç:"c", Ğ:"g", İ:"i", I:"i", Ö:"o", Ş:"s", Ü:"u",
  };
  return s
    .trim()
    .replace(/[^\w\s-]/g, "")
    .split("")
    .map(ch => map[ch] ?? ch)
    .join("")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

export async function POST(req: Request) {
  try {
    const data = (await req.json()) as Body;

    const title = (data.title || "").trim();
    const rawSlug = (data.slug || title || "").trim();
    const slug = normalizeSlug(rawSlug || "yazi");

    if (!title) {
      return NextResponse.json({ ok: false, error: "Başlık zorunlu." }, { status: 400 });
    }

    const now = Date.now();
    const createdAt = String(now);

    // Mevcut mu? (mükerrer kontrolü)
    const exists = await redis.exists(`blog:post:${slug}`);
    const isNew = !exists;

    // Kaydet
    const payload: Record<string, string> = {
      title,
      slug,
      content: data.content || "",
      description: data.description || "",
      image: data.image || "",
      status: data.status === "pub" ? "pub" : "draft",
      // SEO
      seoTitle: data.seoTitle || "",
      seoDescription: data.seoDescription || "",
      ogImage: data.ogImage || "",
      // zaman damgaları
      updatedAt: createdAt,
    };
    if (isNew) payload.createdAt = createdAt;

    await redis.hset(`blog:post:${slug}`, payload);

    // Index’e skor olarak zaman yaz (yeni → eski listeleme)
    await redis.zadd("blog:index", { score: now, member: slug });

    return NextResponse.json({ ok: true, slug, isNew }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Kayıt hatası" }, { status: 500 });
  }
}
