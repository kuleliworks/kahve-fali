import { NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const ORIGIN = process.env.BLOB_PUBLIC_BASE; // <- env ZORUNLU

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ path?: string[] }> } // optional catch-all + Promise tip
) {
  if (!ORIGIN) {
    return new NextResponse("BLOB_PUBLIC_BASE not set", { status: 500 });
  }

  const { path } = await ctx.params;
  const key = (path || []).join("/");
  if (!key) return new NextResponse("Not Found", { status: 404 });

  const upstream = await fetch(`${ORIGIN}/${encodeURI(key)}`);
  if (!upstream.ok) return new NextResponse("Not Found", { status: 404 });

  const headers = new Headers(upstream.headers);
  headers.set("cache-control", "public, max-age=31536000, s-maxage=31536000, immutable");
  headers.delete("x-vercel-id");

  return new NextResponse(upstream.body, { status: upstream.status, headers });
}
