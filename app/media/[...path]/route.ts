import { redis } from "@/lib/redis";

// Bu route: /media/{key} → Redis’ten public URL’i bulur → 302 redirect yapar
// Next 15 uyumluluğu için params Promise olarak alınır.
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ path?: string[] }> }
) {
  const { path } = await ctx.params;
  const key = Array.isArray(path) ? path.join("/") : "";

  if (!key) {
    return new Response("Not Found", { status: 404 });
  }

  // Redis’teki map: media:url:{key} => public URL (imzalı)
  const url = await redis.get<string>(`media:url:${key}`);

  if (!url) {
    // Eşleşme yoksa 404
    return new Response("Not Found", { status: 404 });
  }

  // Kalıcı yönlendirme da yapabilirsin ama cache’i sen yönetmek istersin diye 302 bıraktım
  return Response.redirect(url, 302);
}
