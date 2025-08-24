import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cursor = Number(searchParams.get("cursor") || "0"); // offset
  const limit = 9;

  // Yeni -> eski (index ile)
  const slugs = (await redis.zrange("blog:index", cursor, cursor + limit - 1, {
    rev: true,
  })) as string[];

  const items: Array<{
    slug: string;
    title: string;
    description?: string;
    image?: string;
    createdAt?: string;
  }> = [];

  for (const slug of slugs) {
    const it = await redis.hgetall<Record<string, string>>(`blog:post:${slug}`);
    if (it && it.status === "pub") {
      items.push({
        slug,
        title: it.title,
        description: it.description || "",
        image: it.image || "",
        createdAt: it.createdAt,
      });
    }
  }

  const nextCursor = items.length === limit ? cursor + limit : null;

  return NextResponse.json({ items, nextCursor });
}
