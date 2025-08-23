import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function GET() {
  const now = Date.now();
  // publishAt <= now olanları al
  const due = (await redis.zrange("blog:scheduled", "-inf", now, {
    byScore: true,
    rev: false,
    offset: 0,
    count: 100,
  })) as string[];

  const published: string[] = [];

  for (const slug of due) {
    const key = `blog:post:${slug}`;
    const post = await redis.hgetall<Record<string, string>>(key);
    if (!post) { await redis.zrem("blog:scheduled", slug); continue; }

    const when = Number(post.publishAt || now) || now;

    await redis.hset(key, {
      status: "pub",
      createdAt: post.createdAt || String(when),
      updatedAt: String(now),
      publishAt: "",
    });

    await redis.zadd("blog:index", { score: when, member: slug });
    await redis.zadd("blog:all", { score: now, member: slug });
    await redis.zrem("blog:scheduled", slug);

    published.push(slug);
  }

  return NextResponse.json({ ok: true, published, count: published.length });
}
