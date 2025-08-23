import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = (searchParams.get("slug") || "").trim();
  if (!slug) return NextResponse.json({ ok: false, error: "slug gerekli" }, { status: 400 });

  const exists = !!(await redis.exists(`blog:post:${slug}`));
  return NextResponse.json({ ok: true, exists });
}
