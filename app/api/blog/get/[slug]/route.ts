// app/api/blog/get/[slug]/route.ts
import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function GET(_req: Request, ctx: any) {
  const slug = ctx?.params?.slug as string;
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });
  const it = await redis.hgetall<Record<string, string>>(`blog:post:${slug}`);
  if (!it) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(it);
}
