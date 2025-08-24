// app/media/[...path]/route.ts
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(
  req: Request,
  ctx: { params: { path: string[] } }
) {
  const key = (ctx.params.path || []).join("/"); // ör: blog/xxx.png
  // Kendi blob "public" host'unu buraya yaz
  const ORIGIN = "https://8jwfpfe0yekztwdc.public.blob.vercel-storage.com";
  const url = `${ORIGIN}/${key}`;

  const res = await fetch(url);
  if (!res.ok) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // İçerik tipini ve güçlü cache headerlarını geçir
  const headers = new Headers(res.headers);
  headers.set(
    "cache-control",
    "public, max-age=31536000, s-maxage=31536000, immutable"
  );

  return new NextResponse(res.body, {
    status: 200,
    headers,
  });
}
