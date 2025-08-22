import { redis } from "@/lib/redis";

export const runtime = "edge";
export const dynamic = "force-dynamic";

function csvEscape(s: unknown) {
  const v = (s ?? "").toString();
  if (v.includes(",") || v.includes('"') || v.includes("\n")) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

export async function GET() {
  const ids = await redis.zrange<string[]>("fal:index", 0, 999, { rev: true });

  const rows = await Promise.all(
    ids.map(async (id) => {
      const it = await redis.hgetall<Record<string, any>>(`fal:item:${id}`);
      return it ? { id, ...it } : null;
    })
  );

  // TIP GUARD: null'ları düşür ve TS’ye “Artık null değil” de
  const typed: Array<Record<string, any>> = rows.filter(
    (r): r is Record<string, any> => r !== null
  );

  const lines: string[] = ["id,createdAt,name,age,gender,photosCount,notes"];
  for (const r of typed) {
    lines.push(
      [
        csvEscape(r.id),
        csvEscape(r.createdAt),
        csvEscape(r.name),
        csvEscape(r.age),
        csvEscape(r.gender),
        csvEscape(r.photosCount),
        csvEscape(r.notes),
      ].join(",")
    );
  }

  const body = lines.join("\n");
  return new Response(body, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="fal-log.csv"',
      "x-robots-tag": "noindex",
    },
  });
}
