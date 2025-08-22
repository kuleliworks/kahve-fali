// app/api/blog/upsert/route.ts
import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { slugify } from "@/lib/slugify";

function okKey(req: Request) {
  const need = process.env.PANEL_KEY || "";
  const got = req.headers.get("x-panel-key") || "";
  return need && got && need === got;
}

export async function POST(req: Request) {
  if (!okKey(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const title = String(body.title || "").trim();
  let slug = String(body.slug || "").trim();
  const description = String(body.description || "");
  const image = String(body.image || "");
  const content = String(body.content || "");
  const status = body.status === "pub" ? "pub" : "draft";

  if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });

  if (!slug) slug = slugify(title);
  else slug = slugify(slug);

  // slug çakışırsa sonuna -2, -3 ekle
  let finalSlug = slug;
  for (let i = 2; i < 1000; i++) {
    const exists = await redis.hgetall(`blog:post:${finalSlug}`);
    if (!exists || exists.slug === slug) break;
    finalSlug = `${slug}-${i}`;
  }

  const now = Date.now().toString();
  const key = `blog:post:${finalSlug}`;
  const exists = await redis.hgetall<Record<string, string>>(key);

  await redis.hset(key, {
    title,
    slug: finalSlug,
    description,
    image,
    content,
    status,
    createdAt: exists?.createdAt || now,
    updatedAt: now,
  });

  // index: sadece yayınlananları en üste taşı, taslaklar da listelensin istersen yine ekle
  await redis.zadd("blog:index", { member: finalSlug, score: Number(now) });

  return NextResponse.json({ ok: true, slug: finalSlug });
}
