import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key") || "";
  const origin = process.env.BLOB_PUBLIC_BASE || "";

  if (!key || !origin) {
    return NextResponse.json({ ok: false, error: "key or ORIGIN missing" }, { status: 400 });
  }

  const probeOrigin = await fetch(`${origin}/${encodeURI(key)}`, { method: "HEAD" });
  const probeMedia  = await fetch(`${new URL(req.url).origin}/media/${encodeURI(key)}`, { method: "HEAD" });

  return NextResponse.json({
    key,
    origin,
    origin_status: probeOrigin.status,
    media_status: probeMedia.status,
  });
}
