// app/api/fal-log/route.ts
import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export const runtime = "nodejs";

type Body = {
  name?: string;
  age?: number;
  gender?: string;
  photosCount?: number;
  readingId?: string;
  notes?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const id = String(body.readingId || "");
    if (!id) {
      return NextResponse.json({ ok: false, error: "id yok" }, { status: 400 });
    }

    const now = Date.now();

    // ZSET: yeni -> eski için score = now
    await redis.zadd("fal:index", { score: now, member: id });

    // HASH
    await redis.hset(`fal:item:${id}`, {
      createdAt: String(now),
      name: String(body.name || ""),
      age: String(body.age ?? ""),
      gender: String(body.gender || ""),
      photosCount: String(body.photosCount ?? 0),
      notes: String(body.notes || ""),
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "log yazılamadı" },
      { status: 500 }
    );
  }
}
