import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function DELETE(_req: Request, ctx: any) {
  try {
    const slug = decodeURIComponent(ctx?.params?.slug || "");
    if (!slug) return NextResponse.json({ error: "slug gerekli" }, { status: 400 });

    // Kayıt var mı?
    const exists = await redis.hgetall<Record<string, string>>(`blog:post:${slug}`);
    if (!exists || Object.keys(exists).length === 0) {
      return NextResponse.json({ error: "Kayıt bulunamadı" }, { status: 404 });
    }

    // KV’den sil
    await Promise.all([
      redis.del(`blog:post:${slug}`),
      redis.zrem("blog:index", slug),
    ]);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "delete failed" }, { status: 500 });
  }
}

// Yanlış methodlara da JSON dön
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
