import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const runtime = "edge";          // Edge: File/Blob doğrudan desteklenir
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const ct = req.headers.get("content-type") || "";
  if (!ct.includes("multipart/form-data")) {
    return NextResponse.json({ ok: false, error: "multipart/form-data gerekli" }, { status: 400 });
  }

  const form = await req.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "file alanı zorunlu" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ ok: false, error: "Sadece görsel yükleyin" }, { status: 400 });
  }

  // Boyut limiti (dilersen artır): 12MB
  const MAX = 12 * 1024 * 1024;
  if (file.size > MAX) {
    return NextResponse.json({ ok: false, error: "Görsel çok büyük (12MB+)" }, { status: 413 });
    // İstersen burada otomatik sıkıştırma/yeniden boyutlandırma akışı planlayabiliriz
  }

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const key = `blog/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  // ⚠️ Edge'de DOĞRUDAN File/Blob veriyoruz (Uint8Array'a ÇEVİRME!)
  const { url } = await put(key, file, {
    access: "public",
    contentType: file.type,
    token: process.env.BLOB_READ_WRITE_TOKEN, // Vercel env'de tanımlı olmalı
  });

  return NextResponse.json({ ok: true, url });
}

export async function GET() {
  // Sadece POST kabul edilsin
  return NextResponse.json({ ok: false, error: "Method Not Allowed" }, { status: 405 });
}
