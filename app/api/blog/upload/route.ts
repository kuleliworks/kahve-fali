import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const runtime = "edge"; // hızlı ve düşük gecikme
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

  // Boyut limiti (ör: 12 MB). İstersen artır: 20 * 1024 * 1024
  const MAX = 12 * 1024 * 1024;
  if (file.size > MAX) {
    return NextResponse.json({ ok: false, error: "Görsel çok büyük (12MB+)" }, { status: 413 });
  }

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const key = `blog/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const ab = await file.arrayBuffer();
  const { url } = await put(key, new Uint8Array(ab), {
    access: "public",
    contentType: file.type,
    token: process.env.BLOB_READ_WRITE_TOKEN, // Vercel env'de ayarlı olmalı
  });

  return NextResponse.json({ ok: true, url });
}

export async function GET() {
  // Bu endpoint sadece POST kabul eder
  return NextResponse.json({ ok: false, error: "Method Not Allowed" }, { status: 405 });
}
