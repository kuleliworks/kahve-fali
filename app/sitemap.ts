import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

// Route davranışı
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Upstash REST env'leri (Vercel > Settings > Environment Variables)
const UP_URL   = process.env.UPSTASH_REDIS_REST_URL || "";
const UP_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || "";

function baseUrl() {
  const u = (SITE?.url || "https://www.kahvefalin.com").replace(/\/$/, "");
  return u;
}

function staticEntries(): MetadataRoute.Sitemap {
  const b = baseUrl();
  const now = new Date();
  return [
    { url: `${b}/`,                   lastModified: now, changeFrequency: "daily",   priority: 1 },
    { url: `${b}/hakkimizda`,         lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${b}/iletisim`,           lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${b}/gizlilik`,           lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${b}/kvkk`,               lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${b}/kullanim-kosullari`, lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${b}/blog`,               lastModified: now, changeFrequency: "daily",   priority: 0.8 },
  ];
}

function safeDate(input: unknown): Date {
  if (!input) return new Date();
  if (typeof input === "number") {
    const d = new Date(input);
    if (!isNaN(d.getTime())) return d;
  }
  if (typeof input === "string") {
    const n = Number(input);
    const d = isNaN(n) ? new Date(input) : new Date(n);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date();
}

async function upstashFetch<T>(path: string, body?: any, timeoutMs = 1500): Promise<T | null> {
  if (!UP_URL || !UP_TOKEN) return null;

  const ac = new AbortController();
  const t = setTimeout(() => ac.abort("timeout"), timeoutMs);

  try {
    const res = await fetch(`${UP_URL.replace(/\/$/, "")}${path}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${UP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : "{}",
      signal: ac.signal,
      // Vercel edge/node cache'ine takılmasın:
      cache: "no-store",
    });
    clearTimeout(t);
    if (!res.ok) return null;
    const json = (await res.json()) as any;
    return (json?.result ?? null) as T | null;
  } catch {
    clearTimeout(t);
    return null;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const b = baseUrl();
  const base = staticEntries();

  // Env yoksa direkt statik
  if (!UP_URL || !UP_TOKEN) return base;

  // 1) Slug listesini al (en eski→en yeni geliyor; tersine çevir)
  const slugs = (await upstashFetch<string[]>("/zrange/blog:index/0/-1")) || [];
  const newestFirst = slugs.slice().reverse();

  // Çok büyümeyi engelle
  const limited = newestFirst.slice(0, 2000);

  // 2) Her slug için hgetall
  const entries: MetadataRoute.Sitemap = [];
  await Promise.all(
    limited.map(async (slug) => {
      const key = `blog:post:${slug}`;
      // Upstash REST: /hgetall/{key}
      const it = await upstashFetch<Record<string, string>>(`/hgetall/${encodeURIComponent(key)}`);
      if (!it) return;

      const lm = safeDate(it.updatedAt ?? it.createdAt ?? undefined);
      entries.push({
        url: `${b}/blog/${encodeURIComponent(slug)}`,
        lastModified: lm,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    })
  );

  return [...base, ...entries];
}
