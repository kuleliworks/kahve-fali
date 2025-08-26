// app/api/blog/save/route.ts
import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";

function JOK(data: any = {}) {
  return NextResponse.json({ ok: true, ...data });
}
function JERR(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

function slugifyTr(input: string) {
  const map: Record<string, string> = {
    ç: "c", ğ: "g", ı: "i", i: "i", İ: "i", ö: "o", ş: "s", ü: "u",
    Ç: "c", Ğ: "g", I: "i", Ö: "o", Ş: "s", Ü: "u",
  };
  const norm = input.split("").map((ch) => map[ch] ?? ch).join("");
  return norm
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(req: NextRequest) {
  try {
    const raw = await req.text();
    if (!raw) return JERR("Boş istek gövdesi", 400);

    let body: any;
    try {
      body = JSON.parse(raw);
    } catch {
      return JERR("Geçersiz JSON", 400);
    }

    const title = String(body.title || "").trim();
    let slug = String(body.slug || "").trim();
    const description = String(body.description || "").trim();
    const content = String(body.content || "").trim();
    const status: "draft" | "pub" = body.status === "draft" ? "draft" : "pub";
    const image = body.image ? String(body.image) : "";

    if (!title || !description || !content) {
      return JERR("Zorunlu alanlar: başlık, açıklama, içerik", 400);
    }
    if (!slug) slug = slugifyTr(title);
    if (!slug) return JERR("Slug üretilemedi", 400);

    const key = `blog:post:${slug}`;

    // Mükerer slug kontrolü
    const exists = await redis.exists(key);
    if (exists) return JERR("Bu slug zaten var", 409);

    const nowIso = new Date().toISOString();
    const record = {
      title,
      slug,
      description,
      content,
      status,            // "pub" ise listeye alınır
      image,             // Vercel Blob URL’si
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    // Yazıyı kaydet
    await Promise.all([
      redis.hset(key, record),
      status === "pub"
        ? redis.zadd("blog:index", { score: Date.now(), member: slug })
        : Promise.resolve(),
    ]);

    // Listeleri/sitemap’i tazele (best-effort)
    try {
      revalidatePath("/blog");
      revalidatePath("/sitemap.xml");
    } catch {}

    return JOK({ slug });
  } catch (e: any) {
    return JERR(e?.message || "Sunucu hatası", 500);
  }
}

// İsteğe bağlı sağlık kontrolü (GET 405 yerine anlaşılır yanıt)
export async function GET() {
  return JERR("POST kullanın", 405);
}
