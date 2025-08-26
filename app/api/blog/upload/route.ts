// app/api/blog/upload/route.ts
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const runtime = "edge";

// İstersen GET’e bilgi amaçlı JSON dönelim (tarayıcıda 405 yerine açıklama görürsün)
export async function GET() {
  return NextResponse.json(
    { ok: false, error: "Only POST with multipart/form-data is allowed." },
    { status: 405 }
  );
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const folder = String(form.get("folder") || "blog");

    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "file alanı zorunlu." }, { status: 400 });
    }

    // Basit tip ve boyut kontrolleri (isteğe bağlı)
    const type = file.type || "";
    if (!type.startsWith("image/")) {
      return NextResponse.json({ ok: false, error: "Sadece görsel yükleyebilirsiniz." }, { status: 400 });
    }
    const maxBytes = 20 * 1024 * 1024; // 20MB
    if (file.size > maxBytes) {
      return NextResponse.json({ ok: false, error: "Dosya boyutu 20MB'ı aşamaz." }, { status: 400 });
    }

    // Uzantı belirle
    const fromName = (file.name || "").trim();
    const nameExt =
      fromName && fromName.includes(".") ? fromName.split(".").pop()!.toLowerCase() : "";
    const inferExt = type.replace("image/", "") || "jpg";
    const ext = (nameExt || inferExt).replace(/[^\w]+/g, "") || "jpg";

    const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    // Vercel Blob: token varsa kullan, yoksa projeye bağlı kimlikle çalışır
    const { url } = await put(key, file, {
      access: "public",
      contentType: type || "application/octet-stream",
      token: process.env.BLOB_READ_WRITE_TOKEN || undefined,
    });

    return NextResponse.json({ ok: true, url, key });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Yükleme başarısız." },
      { status: 500 }
    );
  }
}
