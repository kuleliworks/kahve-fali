import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { customAlphabet } from "nanoid";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 12);

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ ok: false, error: "file missing" }, { status: 400 });
    }

    const extGuess = (() => {
      const m = (file.name || "").match(/\.(jpe?g|png|webp|gif|avif)$/i);
      if (m) return m[1].toLowerCase();
      const t = file.type;
      if (t === "image/jpeg") return "jpg";
      if (t === "image/png") return "png";
      if (t === "image/webp") return "webp";
      if (t === "image/gif") return "gif";
      if (t === "image/avif") return "avif";
      return "png";
    })();

    const key = `blog/${Date.now()}-${nanoid()}.${extGuess}`;

    // File (Blob) doğrudan put'a verilebilir (Edge)
    const result = await put(key, file, {
      access: "public",
      contentType: file.type || "application/octet-stream",
      token: process.env.BLOB_READ_WRITE_TOKEN, // Vercel env'de
    });

    // result.pathname başında / ile gelebilir; temizleyelim
    const pathname = (result.pathname || "").replace(/^\/+/, "");
    const publicUrl = result.url; // absolute

    return NextResponse.json({
      ok: true,
      key: pathname,     // örn: blog/1756...png
      publicUrl,         // örn: https://abcd.public.blob.../blog/1756...png
      url: result.url,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "upload failed" }, { status: 500 });
  }
}
