import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { redis } from "@/lib/redis";

// İsteğe bağlı ama iyi olur: büyük dosya/uzantı kontrolü
const MAX_MB = 15;

function extFrom(file: File) {
  // Önce isme bak, yoksa MIME'dan üret
  const name = file.name || "";
  const byName = name.includes(".") ? "." + name.split(".").pop()!.toLowerCase() : "";
  if (byName) return byName;

  const map: Record<string,string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/heic": ".heic",
    "image/heif": ".heif"
  };
  return map[file.type] || "";
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "file alanı zorunlu" }, { status: 400 });
    }

    // Boyut kontrolü
    const sizeMB = (file.size || 0) / (1024 * 1024);
    if (sizeMB > MAX_MB) {
      return NextResponse.json({ error: `Dosya çok büyük. Maksimum ${MAX_MB}MB` }, { status: 413 });
    }

    const ext = extFrom(file) || ""; // uzantı yoksa blobs yine çalışır ama mümkünse uzantı kalsın
    const key = `blog/${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;

    // Vercel Blob'a YÜKLEME — File nesnesini doğrudan ver
    const { url } = await put(key, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN, // Vercel env'de tanımlı olmalı
    });

    // 🔑 ÖNEMLİ: key → url eşlemesini Redis’e yaz (1 yıl)
    await redis.set(`media:url:${key}`, url, { ex: 60 * 60 * 24 * 365 });

    return NextResponse.json({ ok: true, url, key }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Upload hatası" }, { status: 500 });
  }
}
