// app/api/blog/upload/route.ts
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

// İsteğe bağlı ama hızlı/uyumlu: Edge
export const runtime = "edge";

// Sadece POST; tarayıcıda direkt GET ile açarsanız 405 görürsünüz — normal.
export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
    }

    // İsteğe bağlı: alt klasör ismi
    const folder = String(form.get("folder") || "blog");

    // Basit isim üretimi
    const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
    const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;

    // Vercel Blob'a public upload
    // (Token otomatik bağlıysa options.token vermek zorunda değilsiniz)
    const { url } = await put(key, file, {
      access: "public",
      contentType: file.type || "application/octet-stream",
    });

    return NextResponse.json({ ok: true, url });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Yükleme hatası" },
      { status: 500 }
    );
  }
}
