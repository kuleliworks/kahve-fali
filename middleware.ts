import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/panel")) {
    const user = process.env.ADMIN_USER || "admin";
    const pass = process.env.ADMIN_PASS || "changeme";

    const auth = req.headers.get("authorization") || "";
    if (!auth.startsWith("Basic ")) {
      return new NextResponse("Auth required", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="panel"' },
      });
    }
    const base64 = auth.split(" ")[1] || "";
    const [u, p] = atob(base64).split(":");

    if (u !== user || p !== pass) {
      return new NextResponse("Unauthorized", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="panel"' },
      });
    }
  }
  return NextResponse.next();
}
export const config = { matcher: ["/panel/:path*"] };
