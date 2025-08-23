import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function GET() {
  // Çeşitli endekslerden son 200 slug
  async function last200(key: string) {
    try {
      return (await redis.zrange(key, "+inf" as any, "-inf", {
        byScore: true,
        rev: true,
        offset: 0,
        count: 200,
      })) as string[];
    } catch {
      return [] as string[];
    }
  }

  const all = new Set<string>([
    ...(await last200("blog:all")),
    ...(await last200("blog:index")),
    ...(await last200("blog:scheduled")),
  ]);

  const rows: any[] = [];
  for (const slug of all) {
    const it = await redis.hgetall<Record<string, string>>(`blog:post:${slug}`);
    if (!it) continue;
    rows.push({
      slug,
      title: it.title || slug,
      status: it.status || "draft",
      createdAt: it.createdAt || "",
      updatedAt: it.updatedAt || "",
      publishAt: it.publishAt || "",
      image: it.image || "",
      description: it.description || "",
    });
  }

  // updatedAt DESC
  rows.sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0));
  return NextResponse.json({ ok: true, items: rows });
}
