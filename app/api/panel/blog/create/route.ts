import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

type Payload = {
  title: string;
  slug: string;
  description?: string;
  image?: string;
  content?: string; // HTML (sanitize edildiğini varsayıyoruz)
  status?: "draft" | "pub" | "scheduled";
  publishAt?: number | null; // ms (isteğe bağlı)
};

function now() { return Date.now(); }
function isFuture(n?: number | null) { return typeof n === "number" && n > Date.now(); }

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Payload;
    const title = (body.title || "").trim();
    const slug = (body.slug || "").trim();
    if (!title || !slug) {
      return NextResponse.json({ ok: false, error: "title ve slug zorunlu" }, { status: 400 });
    }

    // mükerrer slug?
    if (await redis.exists(`blog:post:${slug}`)) {
      return NextResponse.json({ ok: false, error: "Bu slug zaten var." }, { status: 409 });
    }

    let status: "draft" | "pub" | "scheduled" = body.status || "draft";
    const publishAt = body.publishAt ?? null;

    // 'pub' ama geleceğe tarih verildiyse 'scheduled' yap
    if (status === "pub" && isFuture(publishAt)) status = "scheduled";

    const createdAt = now();
    const data: Record<string, string> = {
      title,
      slug,
      description: body.description || "",
      image: body.image || "",
      content: body.content || "",
      status,
      createdAt: String(createdAt),
      updatedAt: String(createdAt),
    };
    if (publishAt) data.publishAt = String(publishAt);

    // kaydet
    await redis.hset(`blog:post:${slug}`, data);

    // indeksler
    // - tüm yazılar (yönetim listesi için)
    await redis.zadd("blog:all", { score: createdAt, member: slug });

    // - yayımlananlar
    if (status === "pub") {
      await redis.zadd("blog:index", { score: publishAt ?? createdAt, member: slug });
    }

    // - zamanlı yayın
    if (status === "scheduled" && publishAt) {
      await redis.zadd("blog:scheduled", { score: publishAt, member: slug });
    }

    return NextResponse.json({ ok: true, slug, status });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Beklenmeyen hata" }, { status: 500 });
  }
}
