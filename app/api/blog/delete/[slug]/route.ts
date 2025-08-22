// app/api/blog/delete/[slug]/route.ts
import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function POST(req: Request, ctx: any) {
  const need = process.env.PANEL_KEY || "";
  const got = req.headers.get("x-panel-key") || "";
  if (!need || got !== need) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const slug = ctx?.params?.slug as string;
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  await redis.del(`blog:post:${slug}`);
  await redis.zrem("blog:index", slug);
  return NextResponse.json({ ok: true });
}
