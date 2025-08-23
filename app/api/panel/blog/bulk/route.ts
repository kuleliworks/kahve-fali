import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

type Payload = {
  action: "delete" | "publish" | "draft";
  slugs: string[];
};

export async function POST(req: Request) {
  try {
    const { action, slugs } = (await req.json()) as Payload;
    if (!action || !Array.isArray(slugs) || slugs.length === 0) {
      return NextResponse.json({ ok: false, error: "action ve slugs gerekli" }, { status: 400 });
    }

    const results: Array<{ slug: string; ok: boolean; error?: string }> = [];

    for (const slug of slugs) {
      const key = `blog:post:${slug}`;
      const exists = await redis.exists(key);
      if (!exists) {
        results.push({ slug, ok: false, error: "bulunamadı" });
        continue;
      }

      if (action === "delete") {
        await redis.del(key);
        await redis.zrem("blog:index", slug);
        await redis.zrem("blog:scheduled", slug);
        await redis.zrem("blog:all", slug);
        results.push({ slug, ok: true });
      } else if (action === "publish") {
        const post = await redis.hgetall<Record<string, string>>(key);
        if (!post) { results.push({ slug, ok: false, error: "bulunamadı" }); continue; }
        const when = Date.now();
        await redis.hset(key, { status: "pub", updatedAt: String(when), publishAt: "" });
        await redis.zadd("blog:index", { score: when, member: slug });
        await redis.zrem("blog:scheduled", slug);
        await redis.zadd("blog:all", { score: when, member: slug });
        results.push({ slug, ok: true });
      } else if (action === "draft") {
        const when = Date.now();
        await redis.hset(key, { status: "draft", updatedAt: String(when) });
        await redis.zrem("blog:index", slug);
        // planned ise iptal
        await redis.zrem("blog:scheduled", slug);
        await redis.zadd("blog:all", { score: when, member: slug });
        results.push({ slug, ok: true });
      }
    }

    return NextResponse.json({ ok: true, results });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Beklenmeyen hata" }, { status: 500 });
  }
}
