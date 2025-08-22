// app/api/blog/upload/route.ts
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const runtime = "nodejs";    // Node runtime'ta çalışsın
export const maxDuration = 60;      // büyük dosyalar için zaman limiti

const MAX_SIZE = 10 * 1024 * 1024;  // 10MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "Dosya gerekli." }, { status: 400 });
    }

    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: "Sadece JPG/PNG/WEBP/GIF yüklenebilir." }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Maksimum 10MB dosya yükleyebilirsin." }, { status: 400 });
    }

    const safeName = file.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9.\-_]/g, "");
    const key = `blog/${Date.now()}-${safeName}`;

    const { url } = await put(key, file, {
      access: "public",
      addRandomSuffix: true,
      multipart: true,
      token: process.env.BLOB_READ_WRITE_TOKEN, // Vercel Env
    });

    return NextResponse.json({ url });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "upload failed" }, { status: 500 });
  }
}
