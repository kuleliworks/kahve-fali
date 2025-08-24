import { NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

// Bunu .env'e koyarsan domainini kolayca değiştirirsin:
// BLOB_PUBLIC_BASE=https://<senin-public-blob-hostun>.public.blob.vercel-storage.com
const ORIGIN =
  process.env.BLOB_PUBLIC_BASE ||
  "https://8jwfpfe0yekztwdc.public.blob.vercel-storage.com"; // <- kendi public blob hostunu yazabilirsin

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> } // <-- ÖNEMLİ: Promise
) {
  const { path } = await params;
  const key = Array.isArray(path) ? path.join("/") : "";
  if (!key) return new NextResponse("Not Found", { status: 404 });

  const upstream = await fetch(`${ORIGIN}/${encodeURI(key)}`);

  if (!upstream.ok) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const headers = new Headers(upstream.headers);
  headers.set(
    "cache-control",
    "public, max-age=31536000, s-maxage=31536000, immutable"
  );
  // gereksiz bazı header'ları temizleyebiliriz
  headers.delete("x-vercel-id");

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers,
  });
}
