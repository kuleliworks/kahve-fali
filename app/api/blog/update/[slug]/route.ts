import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function POST(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  try {
    const body = await _req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Boş gövde" }, { status: 400 });

    const key = `blog:post:${slug}`;
    const exists = await redis.exists(key);
    if (!exists) return NextResponse.json({ error: "Kayıt bulunamadı" }, { status: 404 });

    const { title, description, image, content, status } = body;

    const patch: Record<string, string> = {};
    if (typeof title === "string") patch.title = title;
    if (typeof description === "string") patch.description = description;
    if (typeof image === "string") patch.image = image;          // <-- ÖNEMLİ
    if (typeof content === "string") patch.content = content;
    if (typeof status === "string") patch.status = status;

    if (Object.keys(patch).length) {
      await redis.hset(key, patch);
    }

    return NextResponse.json({ ok: true, slug });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Beklenmedik hata" }, { status: 500 });
  }
}
