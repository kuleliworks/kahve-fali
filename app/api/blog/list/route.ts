import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limitQ = Number(url.searchParams.get("limit") || 9);
    const limit = Math.min(Math.max(limitQ, 1), 24);

    const cursorParam = url.searchParams.get("cursor");
    const max: number | "+inf" = cursorParam ? Number(cursorParam) : "+inf";

    const slugs = (await redis.zrange("blog:index", max as any, "-inf", {
      byScore: true,
      rev: true,
      offset: 0,
      count: limit,
    })) as string[];

    const items: Array<{ slug: string; title: string; description?: string; image?: string; createdAt?: string }> = [];

    for (const slug of slugs) {
      const it = await redis.hgetall<Record<string, string>>(`blog:post:${slug}`);
      if (!it || Object.keys(it).length === 0) continue;
      if (it.status && it.status !== "pub") continue;

      items.push({
        slug,
        title: it.title || slug,
        description: it.description || "",
        image: it.image || "",
        createdAt: it.createdAt || "",
      });
    }

    let nextCursor: number | null = null;
    if (slugs.length === limit) {
      const lastSlug = slugs[slugs.length - 1];
      const s = await redis.zscore("blog:index", lastSlug);
      if (s !== null && s !== undefined) nextCursor = Number(s) - 1;
    }

    return NextResponse.json(
      { items, nextCursor },
      {
        status: 200,
        headers: {
          // 2 dk edge cache, 10 dk SWR
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
        },
      }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "list failed" }, { status: 500 });
  }
}
