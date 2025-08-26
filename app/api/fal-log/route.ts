// app/api/fal-log/route.ts
import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export const runtime = "edge"; // Upstash REST ile Edge uyumlu

const NINETY_DAYS_SEC = 90 * 24 * 60 * 60;
const NINETY_DAYS_MS = NINETY_DAYS_SEC * 1000;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));

    // StepForm'dan gelen alanlar
    const name = String(body?.name || "").slice(0, 80);
    const gender = String(body?.gender || "");
    const age = Number(body?.age || 0) || 0;
    const photosCount = Number(body?.photosCount || 0) || 0;
    const readingIdRaw = String(body?.readingId || "").trim();
    const notes = String(body?.notes || "");

    if (!readingIdRaw) {
      return NextResponse.json({ ok: false, error: "Missing readingId" }, { status: 400 });
    }

    // Base64url harici karakterleri temizle (güvenlik için)
    const readingId = readingIdRaw.replace(/[^a-zA-Z0-9\-_]/g, "").slice(0, 512);

    const now = Date.now();
    const itemKey = `fal:item:${readingId}`;

    const payload = {
      id: readingId,
      createdAt: String(now),
      name,
      gender,
      age: String(age),
      photosCount: String(photosCount),
      notes,
    };

    // Hash yaz (90 gün TTL)
    await redis.hset(itemKey, payload);
    await redis.expire(itemKey, NINETY_DAYS_SEC);

    // Index’e skor olarak timestamp ile ekle
    await redis.zadd("fal:index", { score: now, member: readingId });

    // Eski (90 günden daha eski) index üyelerini temizlemeye çalış (best-effort)
    await redis.zremrangebyscore("fal:index", 0, now - NINETY_DAYS_MS);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "log error" },
      { status: 500 }
    );
  }
}
