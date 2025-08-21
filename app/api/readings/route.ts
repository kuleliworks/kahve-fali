import { NextResponse } from "next/server";
import type { Gender } from "@/lib/fortune";
import { encodeId } from "@/lib/id";

function pickIndex() {
  return Math.floor(Math.random() * 10); // 0-9
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
    }

    const name = String(body.name || "").trim().slice(0, 40);
    const gender: Gender = body.gender || "belirtmek-istemiyorum";
    const age = Number(body.age || 0);

    if (!name) return NextResponse.json({ error: "İsim gerekli." }, { status: 400 });
    if (!["kadin", "erkek", "belirtmek-istemiyorum"].includes(gender))
      return NextResponse.json({ error: "Cinsiyet geçersiz." }, { status: 400 });
    if (!Number.isFinite(age) || age < 12 || age > 99)
      return NextResponse.json({ error: "Yaş 12-99 arası olmalı." }, { status: 400 });

    // Fotoğrafları şu an saklamıyoruz (MVP). Sadece varlığı yeterli.
    // const photos: string[] = Array.isArray(body.photos) ? body.photos : [];

    const id = encodeId({
      n: name,
      g: gender,
      a: age,
      i: pickIndex(),
      t: Date.now(),
    });

    return NextResponse.json({ id });
  } catch (e) {
    return NextResponse.json({ error: "Fal oluşturulurken bir hata oluştu." }, { status: 500 });
  }
}
