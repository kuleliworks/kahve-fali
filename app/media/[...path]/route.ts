import { redis } from "@/lib/redis";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ path?: string[] }> }
) {
  const { path } = await ctx.params;
  const key = Array.isArray(path) ? path.join("/") : "";

  if (!key) return new Response("Not Found", { status: 404 });

  const url = await redis.get<string>(`media:url:${key}`);
  if (!url) return new Response("Not Found", { status: 404 });

  return Response.redirect(url, 302);
}
