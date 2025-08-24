import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const runtime = "edge";

function extFrom(type: string, fallback = "jpg") {
  const map: Record<string,string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/avif": "avif",
    "image/heic": "jpg", // yaygın dönüşüm
  };
  return map[type] || fallback;
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "file eksik" }, { status: 400 });
    }

    const ext = extFrom(file.type);
    const key = `blog/${Date.now()}-${Math.random().toString(36).slice(2,12)}.${ext}`;

    // Edge ortamda put() doğrudan File/Blob kabul eder
    const result = await put(key, file, {
      access: "public",
      contentType: file.type || "application/octet-stream",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.json({
      ok: true,
      key,
      url: result.url,
      publicUrl: result.url,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "upload hata" }, { status: 500 });
  }
}
