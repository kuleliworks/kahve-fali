// app/api/blog/list/route.ts
import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const slugs = (await redis.zrange<string>("blog:index", 0, -1, { rev: true })) || [];
    const rows = await Promise.all(
      slugs.map(async (slug) => {
        const it = await redis.hgetall<Record<string, string>>(`blog:post:${slug}`);
        if (!it) return null;
        return {
          title: it.title,
          slug: it.slug,
          description: it.description,
          image: it.image,
          status: it.status,
          createdAt: it.createdAt,
          updatedAt: it.updatedAt,
        };
      })
    );
    const items = rows.filter(Boolean);
    return NextResponse.json({ items });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "list error" }, { status: 500 });
  }
}
