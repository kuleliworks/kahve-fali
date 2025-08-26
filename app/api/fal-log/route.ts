import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { name = "", age = 0, gender = "", photosCount = 0, readingId = "" } = body || {};

    const now = Date.now();
    const createdAt = new Date(now).toISOString();

    try {
      await redis.hset(`fal:item:${readingId}`, {
        name: String(name).slice(0, 60),
        gender: String(gender),
        age: String(Number(age) || 0),
        photosCount: String(Number(photosCount) || 0),
        createdAt,
      });
      await redis.zadd("fal:index", { score: now, member: readingId });
    } catch {
      // Redis yoksa sessiz geç
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Log hatası" }, { status: 500 });
  }
}
