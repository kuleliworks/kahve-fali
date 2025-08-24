import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const runtime = "edge";

export async function GET() {
  try {
    // Bu, RW token’ın hangi store’a yazdığını test eder
    const key = `debug/${Date.now()}.txt`;
    const res = await put(key, new Blob(["ok"], { type: "text/plain" }), {
      access: "public",
      contentType: "text/plain",
      token: process.env.BLOB_READ_WRITE_TOKEN, // Vercel ENV
    });

    const originFromWrite = new URL(res.url).origin; // Örn: https://abcd.public.blob.vercel-storage.com

    return NextResponse.json({
      wrote: true,
      key,
      write_url: res.url,
      origin_from_write: originFromWrite,
      origin_env_BLOB_PUBLIC_BASE: process.env.BLOB_PUBLIC_BASE || null,
      hint: "BLOB_PUBLIC_BASE tam olarak origin_from_write ile aynı olmalı",
    });
  } catch (e: any) {
    return NextResponse.json({ wrote: false, error: e?.message }, { status: 500 });
  }
}
