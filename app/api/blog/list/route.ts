// app/api/blog/list/route.ts
import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export const runtime = "edge";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limit = Math.max(1, Math.min(50, Number(url.searchParams.get("limit")) || 9));
    const cursorParam = url.searchParams.get("cursor");
    const start = Number.isFinite(Number(cursorParam)) ? Number(cursorParam) : 0;
    const end = start + limit - 1;

    // Bu sayfanın slug’ları
    const pageSlugsUnknown = await redis.zrange("blog:index", start, end, { rev: true });
    const pageSlugs: string[] = Array.isArray(pageSlugsUnknown)
      ? pageSlugsUnknown.map(String)
      : [];

    // Bir sonraki kayıt var mı?
    const probe = await redis.zrange("blog:index", end + 1, end + 1, { rev: true });
    const nextCursor = Array.isArray(probe) && probe.length > 0 ? end + 1 : null;

    // Kart alanlarını topla
    const items = await Promise.all(
      pageSlugs.map(async (slug) => {
        const it = await redis.hgetall<Record<string, string>>(`blog:post:${slug}`);
        if (!it) return null;
        return {
          slug,
          title: it.title || slug,
          description: it.description || "",
          image: it.image || "",
          createdAt: it.createdAt || "",
        };
      })
    ).then((arr) => arr.filter(Boolean));

    return NextResponse.json({ items, nextCursor });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Listeleme hatası" },
      { status: 500 }
    );
  }
}
