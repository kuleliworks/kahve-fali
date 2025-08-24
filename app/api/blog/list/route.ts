import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const slugs = (await redis.zrange("blog:index", 0, -1, { rev: true })) as string[];

  const items: Array<{slug:string; title:string; description?:string; image?:string; createdAt?:string}> = [];

  for (const slug of slugs) {
    const it = await redis.hgetall<Record<string, string>>(`blog:post:${slug}`);
    if (!it) continue;
    items.push({
      slug,
      title: it.title || slug,
      description: it.description || "",
      image: it.image || "",        // <- ÖNEMLİ
      createdAt: it.createdAt || "",
    });
  }

  return NextResponse.json({ items, nextCursor: null });
}
