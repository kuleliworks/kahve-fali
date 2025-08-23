import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { SITE } from "@/lib/seo";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET() {
  // Son 50 yazıyı al
  const slugs = (await redis.zrange("blog:index", "+inf" as any, "-inf", {
    byScore: true,
    rev: true,
    offset: 0,
    count: 50,
  })) as string[];

  const items: Array<{title:string; slug:string; description?:string; createdAt?:string}> = [];

  for (const slug of slugs) {
    const it = await redis.hgetall<Record<string, string>>(`blog:post:${slug}`);
    if (!it || Object.keys(it).length === 0) continue;
    if (it.status && it.status !== "pub") continue;
    items.push({
      title: it.title || slug,
      slug,
      description: it.description || "",
      createdAt: it.createdAt || "",
    });
  }

  const now = new Date().toUTCString();
  const xmlItems = items
    .map((p) => {
      const link = `${SITE.url}/blog/${p.slug}`;
      const pub = p.createdAt ? new Date(Number(p.createdAt)).toUTCString() : now;
      const desc = (p.description || "").replace(/&/g, "&amp;").replace(/</g, "&lt;");
      const title = (p.title || "").replace(/&/g, "&amp;").replace(/</g, "&lt;");
      return `
  <item>
    <title>${title}</title>
    <link>${link}</link>
    <guid>${link}</guid>
    <pubDate>${pub}</pubDate>
    <description>${desc}</description>
  </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>${SITE.name}</title>
  <link>${SITE.url}</link>
  <description>${SITE.description}</description>
  <lastBuildDate>${now}</lastBuildDate>
  ${xmlItems}
</channel>
</rss>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=600, stale-while-revalidate=600",
    },
  });
}
