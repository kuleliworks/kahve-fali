import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export const runtime = "edge";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const offset = Number(searchParams.get("offset") || 0);
    const limit  = Math.max(1, Math.min(24, Number(searchParams.get("limit") || 9)));

    // Basit yöntem: tamamını çek, sonra slice (miktarlar küçükse uygundur)
    const allSlugs = await redis.zrange<string[]>("blog:index", 0, -1, { rev: true });
    const pageSlugs = (allSlugs || []).slice(offset, offset + limit);

    const items = await Promise.all(
      pageSlugs.map(async (slug) => {
        const it = await redis.hgetall<Record<string,string>>(`blog:post:${slug}`);
        if (!it) return null;
        if (it.status !== "pub") return null;
        return {
          slug,
          title: it.title || slug,
          description: it.description || "",
          image: it.image || "",
          imageKey: it.imageKey || "",
          createdAt: it.createdAt || "",
        };
      })
    );

    const rows = items.filter(Boolean) as Array<{
      slug: string; title: string; description?: string; image?: string; imageKey?: string; createdAt?: string;
    }>;

    return NextResponse.json({ ok: true, items: rows });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Liste hatası" }, { status: 500 });
  }
}
