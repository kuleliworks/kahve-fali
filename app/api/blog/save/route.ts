import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

/** Bu rotada Node.js runtime kullanıyoruz (Edge yerine) */
export const runtime = "nodejs";
// Güvenlik için cache yok
export const dynamic = "force-dynamic";

type Body = {
  title?: string;
  slug?: string;
  description?: string;
  content?: string; // HTML veya düz yazı
  status?: "draft" | "pub";
  image?: string;
};

function json(status: number, data: any) {
  return NextResponse.json(data, { status });
}

/** TR karakter normalize + güvenli slug */
function normalizeTr(s: string) {
  const map: Record<string, string> = {
    ç: "c", ğ: "g", ı: "i", i: "i", İ: "i", ö: "o", ş: "s", ü: "u",
    Ç: "c", Ğ: "g", I: "i", Ö: "o", Ş: "s", Ü: "u",
  };
  return s.split("").map((ch) => map[ch] ?? ch).join("");
}
function cleanSlug(raw: string) {
  return normalizeTr(raw)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(req: NextRequest) {
  try {
    // ——— 1) BODY'yi al
    let body: Body | null = null;
    try {
      body = await req.json();
    } catch {
      return json(400, { ok: false, error: "Geçersiz gövde (JSON bekleniyor)" });
    }
    if (!body) {
      return json(400, { ok: false, error: "Boş istek gövdesi" });
    }

    // ——— 2) Alanları doğrula
    const title = String(body.title || "").trim();
    const rawSlug = String(body.slug || "").trim();
    const description = String(body.description || "").trim();
    const content = String(body.content || "").trim();
    const status: "draft" | "pub" = body.status === "pub" ? "pub" : "draft";
    const image = body.image ? String(body.image) : undefined;

    if (!title || !rawSlug || !description || !content) {
      return json(400, { ok: false, error: "Zorunlu alanlar: title, slug, description, content" });
    }

    const slug = cleanSlug(rawSlug);
    if (!slug) {
      return json(400, { ok: false, error: "Geçersiz slug" });
    }
    if (slug.length > 140) {
      return json(400, { ok: false, error: "Slug çok uzun" });
    }

    // ——— 3) Anahtarlar
    const keyPost = `blog:post:${slug}`;
    const keyIndex = "blog:index"; // zset (sadece yayınlar)

    // ——— 4) Çakışma kontrolü
    // (İstersen mevcut yazıyı güncellemeye çeviririz; burada "yeni kayıt" mantığı var.)
    const exists = await redis.exists(keyPost);
    if (exists) {
      // Mevcutsa 409 veriyoruz
      return json(409, { ok: false, error: "Bu slug zaten var", slug });
    }

    const now = Date.now().toString();

    // ——— 5) Kayıt
    // Taslaklar zset'e eklenmez, yayınlananlar eklenir.
    const hash: Record<string, string> = {
      title,
      slug,
      description,
      content,
      status,
      createdAt: now,
      updatedAt: now,
    };
    if (image) hash.image = image;

    await redis.hset(keyPost, hash);

    if (status === "pub") {
      // En yeni yukarıda olacak şekilde score = zaman
      await redis.zadd(keyIndex, { score: Date.now(), member: slug });
    } else {
      // Taslaksa varsa index'ten çıkar (temizlik)
      await redis.zrem(keyIndex, slug);
    }

    // ——— 6) Yanıt
    return json(200, { ok: true, slug, status });
  } catch (e: any) {
    // Her durumda JSON dön
    console.error("[/api/blog/save] error:", e?.message || e);
    return json(500, { ok: false, error: "Sunucu hatası" });
  }
}

// Diğer methodlar kapalı
export async function GET() {
  return json(405, { ok: false, error: "Method Not Allowed" });
}
export async function PUT() {
  return json(405, { ok: false, error: "Method Not Allowed" });
}
export async function DELETE() {
  return json(405, { ok: false, error: "Method Not Allowed" });
}
