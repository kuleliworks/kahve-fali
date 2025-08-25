// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Bu yolları tamamen serbest bırak (özellikle sitemap.xml ve robots.txt)
  if (
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt" ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/static/") ||
    pathname.startsWith("/media/") ||
    pathname.startsWith("/api/")
  ) {
    return NextResponse.next();
  }

  // Sadece /panel altında Basic Auth iste
  if (pathname.startsWith("/panel")) {
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
    // Middleware edge ortamında çalıştığı için atob kullanılabilir
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

// NOT: Aşağıdaki config'i tamamen kaldırabilirsin.
// Eğer mutlaka matcher kullanmak istiyorsan, her şeyi kapsayan güvenli bir örnek:
// export const config = {
//   matcher: ["/((?!_next|static|media|api).*)"],
// };
