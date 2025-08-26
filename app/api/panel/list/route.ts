// app/api/panel/list/route.ts
import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export const runtime = "nodejs";

type Row = {
  id: string;
  createdAt?: string;
  name?: string;
  age?: string;
  gender?: string;
  photosCount?: string;
};

export async function GET() {
  try {
    // Yeni -> Eski
    const ids = (await redis.zrange("fal:index", 0, -1, { rev: true })) as string[];

    const rows: Row[] = [];
    for (const id of ids) {
      const it = await redis.hgetall<Record<string, string>>(`fal:item:${id}`);
      if (it) rows.push({ id, ...it });
    }

    return NextResponse.json({ ok: true, rows });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "liste hatası" }, { status: 500 });
  }
}
