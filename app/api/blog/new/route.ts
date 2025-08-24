// app/api/blog/new/route.ts
export const runtime = "edge";

import { NextResponse } from "next/server";

type Body = {
  title?: string;
  slug?: string;
  description?: string;
  image?: string;
  content?: string;
  status?: "draft" | "pub";
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9\- ]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export async function POST(req: Request) {
  try {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      return NextResponse.json(
        { error: "Redis ayarları eksik (URL/TOKEN)." },
        { status: 500 }
      );
    }

    const body = (await req.json().catch(() => ({}))) as Body;
    const title = (body.title || "").trim();
    const rawSlug = (body.slug || "").trim();
    const description = (body.description || "").trim();
    const image = (body.image || "").trim();
    const content = (body.content || "").trim();
    const status: "draft" | "pub" = body.status === "pub" ? "pub" : "draft";

    if (!title || !content) {
      return NextResponse.json(
        { error: "Başlık ve içerik zorunlu." },
        { status: 400 }
      );
    }

    const slug = rawSlug ? slugify(rawSlug) : slugify(title) || `yazi-${Date.now()}`;
    const key = `blog:post:${slug}`;
    const now = Date.now();
    const iso = new Date(now).toISOString();

    // Aynı slug var mı? (EXISTS)
    {
      const existsRes = await fetch(`${url}/exists/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const existsJson = (await existsRes.json().catch(() => ({}))) as any;
      if (Array.isArray(existsJson?.result) ? existsJson.result[0] === 1 : existsJson?.result === 1) {
        return NextResponse.json(
          { error: "Bu slug zaten mevcut." },
          { status: 409 }
        );
      }
    }

    // Pipeline: ZADD + HSET
    const pipeCmds = [
      ["ZADD", "blog:index", now.toString(), slug],
      [
        "HSET",
        key,
        "title", title,
        "slug", slug,
        "description", description,
        "image", image,
        "content", content,
        "status", status,
        "createdAt", iso
      ]
    ];

    // 10 saniye timeout ile isteği yap
    const ac = new AbortController();
    const tm = setTimeout(() => ac.abort(), 10000);

    const resp = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(pipeCmds),
      signal: ac.signal,
      cache: "no-store",
    }).finally(() => clearTimeout(tm));

    const data = await resp.json().catch(() => ({} as any));
    if (!resp.ok) {
      return NextResponse.json(
        { error: data?.error || "Redis kaydı başarısız" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, slug }, { status: 200 });
  } catch (e: any) {
    const aborted = e?.name === "AbortError";
    return NextResponse.json(
      { error: aborted ? "Sunucu zaman aşımı." : (e?.message || "Sunucu hatası") },
      { status: 500 }
    );
  }
}
