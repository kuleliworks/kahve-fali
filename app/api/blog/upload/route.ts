import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const runtime = "edge";
export const dynamic = "force-dynamic";

function getExt(file: File): string {
  const byName = file.name?.split(".").pop()?.toLowerCase();
  if (byName && byName.length <= 5) return byName;
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/avif": "avif",
  };
  return map[file.type] || "jpg";
}

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

  // Boyut limiti (dilersen artır)
  const MAX = 12 * 1024 * 1024;
  if (file.size > MAX) {
    return NextResponse.json({ ok: false, error: "Görsel çok büyük (12MB+)" }, { status: 413 });
  }

  const ext = getExt(file);
  const key = `blog/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  // Edge ortamında File doğrudan Blob olarak verilir (Uint8Array kullanma!)
  const { url } = await put(key, file, {
    access: "public",
    contentType: file.type,
    token: process.env.BLOB_READ_WRITE_TOKEN, // Vercel'de env olarak ekli olmalı
  });

  // Kendi domaininden servis etmek için /media proxy’imiz
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://kahvefalin.com";
  const publicUrl = `${base}/media/${key}`;

  return NextResponse.json({ ok: true, url, publicUrl, key });
}

export async function GET() {
  return NextResponse.json({ ok: false, error: "Method Not Allowed" }, { status: 405 });
}
