// app/api/readings/route.ts
import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export const runtime = "nodejs"; // Edge yerine Node: daha toleranslı

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
    }

    const name = String(body.name || "").slice(0, 60);
    const gender = String(body.gender || "");
    const age = Number(body.age || 0) || 0;

    // Artık fotoğrafları base64 taşımıyoruz.
    // Sadece sayı gönderiyoruz (gövdeyi hafif tut).
    const photosCount = Number(body.photosCount || 0) || 0;

    // ID: URL-safe base64 (sayfada decode ettiğimiz minimal bilgiler)
    const payload = { n: name, g: gender, a: age, i: photosCount, t: Date.now() };
    const id = Buffer.from(JSON.stringify(payload)).toString("base64url");

    // Panel için hafif bir kayıt (varsa Redis)
    try {
      await redis.hset(`fal:item:${id}`, {
        name,
        gender,
        age: String(age),
        photosCount: String(photosCount),
        createdAt: new Date().toISOString(),
      });
      await redis.zadd("fal:index", { score: Date.now(), member: id });
    } catch {
      // Redis yoksa sessizce geç
    }

    return NextResponse.json({ ok: true, id });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Fal servisi hatası" },
      { status: 500 }
    );
  }
}
